from decimal import Decimal
import hmac
import hashlib
import razorpay
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem, Payments
from .serializers import PlaceOrderSerializer, OrderItemSerializer
from products.models import Cart
from wallet.models import Wallet,WalletTransaction


class PlaceOrder(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        selected_product_ids = serializer.validated_data["selected_product_ids"]
        name = serializer.validated_data["name"]
        address = serializer.validated_data["address"]
        pincode = serializer.validated_data["pincode"]
        phone = serializer.validated_data["phone"]
        payment_method = serializer.validated_data["payment_method"]

        cart_items = Cart.objects.filter(
            user=user,
            product__id__in=selected_product_ids
        ).select_related("product")

        if not cart_items.exists():
            return Response(
                {"message": "Selected cart items not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = Decimal("0.00")
        total_items = 0

        for item in cart_items:
            total_amount += item.product.price * item.quantity
            total_items += item.quantity
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            name=name,
            address=address,
            pincode=pincode,
            phone=phone
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                price=item.product.price,
                quantity=item.quantity
            )
        payment_status = "completed" if payment_method =="cod" else "pending"
        payment = Payments.objects.create(
            user=user,
            order=order,
            total_amount=total_amount,
            payment_status=payment_status,
            payment_method=payment_method
        )

        if payment_method == "cod":
            cart_items.delete()

            return Response(
                {
                    "message": "Order placed successfully",
                    "order_id": order.id,
                    "payment_id": payment.id,
                    "total_amount": str(total_amount),
                    "total_items": total_items,
                    "payment_method": "cod"
                },
                status=status.HTTP_201_CREATED
            )

        if payment_method == "onlinepayment":
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

            razorpay_order = client.order.create({
                "amount": int(total_amount * 100),
                "currency": "INR",
                "payment_capture": 1
            })

            order.razorpay_order_id = razorpay_order["id"]
            order.save()

            return Response(
                {
                    "message": "Razorpay order created",
                    "order_id": order.id,
                    "payment_id": payment.id,
                    "total_amount": str(total_amount),
                    "total_items": total_items,
                    "payment_method": "onlinepayment",
                    "razorpay_order_id": razorpay_order["id"],
                    "razorpay_amount": razorpay_order["amount"],
                    "razorpay_currency": razorpay_order["currency"],
                    "razorpay_key": settings.RAZORPAY_KEY_ID,
                },
                status=status.HTTP_201_CREATED
            )
        if payment_method =='wallet':
            wallet, created = Wallet.objects.get_or_create(user=user)
            
            if wallet.balance < total_amount:
                return Response({
                    "message":"insuddicient money"
                },status=status.HTTP_400_BAD_REQUEST)

            wallet.balance -=total_amount
            wallet.save()
            
            WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type="debit",
            amount=total_amount,
            description=f"Payment for order {order.id}"
            )
            
            payment.payment_status = "completed"
            payment.save()
            return Response({
            "message": "Order placed successfully using wallet",
            "order_id": order.id,
            "payment_id": payment.id,
            "total_amount": str(total_amount),
            "total_items": total_items,
            "payment_method": "wallet"
            })
        return Response(
            {"message": "Invalid payment method"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
class VerifyPayment(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")
        order_id = request.data.get("order_id")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id]):
            return Response(
                {"message": "All payment verification fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payments.objects.select_related("order").get(
                order_id=order_id,
                user=request.user
            )
        except Payments.DoesNotExist:
            return Response(
                {"message": "Payment record not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        order = payment.order

        if order.razorpay_order_id != razorpay_order_id:
            return Response(
                {"message": "Invalid Razorpay order id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        generated_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode(),
            msg=f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            payment.payment_status = "failed"
            payment.save()

            return Response(
                {"message": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.save()

        payment.payment_status = "completed"
        payment.save()

        ordered_product_ids = payment.order.items.values_list("product_id", flat=True)
        Cart.objects.filter(
            user=request.user,
            product__id__in=ordered_product_ids
        ).delete()

        return Response(
            {
                "message": "Payment verified successfully",
                "order_id": payment.order.id,
                "payment_id": payment.id
            },
            status=status.HTTP_200_OK
        )
class OrderedItems(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        orders = OrderItem.objects.filter(order__user=user).select_related(
            "order", "product"
        ).prefetch_related("order__payments").order_by("order__created_at")

        serializer = OrderItemSerializer(orders, many=True)
        return Response(serializer.data)
