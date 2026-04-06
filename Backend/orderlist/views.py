from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from payment.models import Payments
from .serializers import OrderListSerializer
from rest_framework.permissions import IsAdminUser
from wallet.models import Wallet, WalletTransaction


class OrderList(APIView):
    def get(self, request):
        orders = Payments.objects.select_related("user", "order").all().order_by("-created_at")
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StatusUpdate(APIView):
    permission_classes = [IsAdminUser]
    def patch(self,request,id):
        try:
            order = Payments.objects.get(id=id)
        except Payments.DoesNotExist:
            return Response(
                {"message": "Order Does not Exist"},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("new_status")
        if not new_status:
            return Response(
                {"message": "Status is Required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.payment_status in ["success", "completed", "paid"] and new_status == "refunded":
            wallet, created = Wallet.objects.get_or_create(
                user=order.user,
                defaults={"balance": Decimal("0.00")}
            )

            wallet.balance += order.total_amount
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type="credit",
                amount=order.total_amount,
                description=f"Refund for order {order.order.id}"
            )

        order.payment_status = new_status
        order.save()

        return Response(
            {"message": "Order Status Updated"},
            status=status.HTTP_200_OK
        )