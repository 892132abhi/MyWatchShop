from decimal import Decimal
import hmac
import hashlib
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.conf import settings
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from accounts.models import Users
from products.models import Products, Cart
from wallet.models import Wallet, WalletTransaction
from .models import Order, OrderItem, Payments
from .views import PlaceOrder, VerifyPayment, OrderedItems


class PaymentModelTests(TestCase):
    def setUp(self):
        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        self.product = Products.objects.create(
            name="Test Watch",
            price=2500,
            brand="BrandX",
            type="Luxury",
            description="Luxury watch",
            quantity=10,
            image="sample.jpg"
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("2500.00"),
            name="Test User",
            address="Test Address",
            pincode="682001",
            phone="9876543210"
        )

    def test_order_creation(self):
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.total_amount, Decimal("2500.00"))
        self.assertEqual(str(self.order), f"Order {self.order.id} - {self.user}")

    def test_order_item_creation(self):
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            price=Decimal("2500.00"),
            quantity=2
        )

        self.assertEqual(item.order, self.order)
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.price, Decimal("2500.00"))
        self.assertEqual(item.quantity, 2)
        self.assertEqual(str(item), f"{self.order.id} - {self.product} - {item.quantity}")

    def test_payment_creation(self):
        payment = Payments.objects.create(
            user=self.user,
            order=self.order,
            total_amount=Decimal("2500.00"),
            payment_status="pending",
            payment_method="cod"
        )

        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.order, self.order)
        self.assertEqual(payment.total_amount, Decimal("2500.00"))
        self.assertEqual(payment.payment_status, "pending")
        self.assertEqual(payment.payment_method, "cod")
        self.assertEqual(str(payment), f"{self.user} - Order {self.order.id}")


class PlaceOrderViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        self.product1 = Products.objects.create(
            name="Watch One",
            price=1000,
            brand="BrandA",
            type="Classic",
            description="First watch",
            quantity=20,
            image="watch1.jpg"
        )

        self.product2 = Products.objects.create(
            name="Watch Two",
            price=2000,
            brand="BrandB",
            type="Sports",
            description="Second watch",
            quantity=20,
            image="watch2.jpg"
        )

        Cart.objects.create(user=self.user, product=self.product1, quantity=2)
        Cart.objects.create(user=self.user, product=self.product2, quantity=1)

        self.valid_payload = {
            "selected_product_ids": [self.product1.id, self.product2.id],
            "name": "Test User",
            "address": "Test Address",
            "pincode": "682001",
            "phone": "9876543210",
            "payment_method": "cod"
        }

    def test_place_order_cod_success(self):
        request = self.factory.post("/payment/placeorder/", self.valid_payload, format="json")
        force_authenticate(request, user=self.user)
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Order placed successfully")
        self.assertEqual(response.data["payment_method"], "cod")
        self.assertEqual(response.data["total_items"], 3)
        self.assertEqual(response.data["total_amount"], "4000.00")

        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 2)
        self.assertEqual(Payments.objects.count(), 1)

        order = Order.objects.first()
        payment = Payments.objects.first()

        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total_amount, Decimal("4000.00"))
        self.assertEqual(payment.payment_status, "completed")
        self.assertEqual(payment.payment_method, "cod")

        self.assertEqual(Cart.objects.filter(user=self.user).count(), 0)

    @patch("payment.views.razorpay.Client")
    def test_place_order_onlinepayment_success(self, mock_razorpay_client):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {
            "id": "order_razorpay_123",
            "amount": 400000,
            "currency": "INR"
        }
        mock_razorpay_client.return_value = mock_client

        payload = self.valid_payload.copy()
        payload["payment_method"] = "onlinepayment"

        request = self.factory.post("/payment/placeorder/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Razorpay order created")
        self.assertEqual(response.data["payment_method"], "onlinepayment")
        self.assertEqual(response.data["razorpay_order_id"], "order_razorpay_123")
        self.assertEqual(response.data["razorpay_amount"], 400000)
        self.assertEqual(response.data["razorpay_currency"], "INR")

        order = Order.objects.first()
        payment = Payments.objects.first()

        self.assertEqual(order.razorpay_order_id, "order_razorpay_123")
        self.assertEqual(payment.payment_status, "pending")
        self.assertEqual(payment.payment_method, "onlinepayment")

        self.assertEqual(Cart.objects.filter(user=self.user).count(), 2)

    def test_place_order_no_cart_items(self):
        Cart.objects.filter(user=self.user).delete()

        request = self.factory.post("/payment/placeorder/", self.valid_payload, format="json")
        force_authenticate(request, user=self.user)
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Selected cart items not found")

    def test_place_order_wallet_success(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.user)
        wallet.balance = Decimal("5000.00")
        wallet.save()

        payload = self.valid_payload.copy()
        payload["payment_method"] = "wallet"

        request = self.factory.post("/payment/placeorder/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Order placed successfully using wallet")
        self.assertEqual(response.data["payment_method"], "wallet")
        self.assertEqual(response.data["total_items"], 3)
        self.assertEqual(response.data["total_amount"], "4000.00")

        payment = Payments.objects.first()
        wallet.refresh_from_db()

        self.assertEqual(payment.payment_status, "completed")
        self.assertEqual(payment.payment_method, "wallet")
        self.assertEqual(wallet.balance, Decimal("1000.00"))
        self.assertEqual(WalletTransaction.objects.count(), 1)

    def test_place_order_wallet_insufficient_money(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.user)
        wallet.balance = Decimal("1000.00")
        wallet.save()

        payload = self.valid_payload.copy()
        payload["payment_method"] = "wallet"

        request = self.factory.post("/payment/placeorder/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "insuddicient money")

    def test_place_order_unauthorized(self):
        request = self.factory.post("/payment/placeorder/", self.valid_payload, format="json")
        response = PlaceOrder.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class VerifyPaymentViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        self.other_user = Users.objects.create_user(
            email="other@example.com",
            password="Test@1234",
            name="Other User",
            is_active=True,
            role="user"
        )

        self.product = Products.objects.create(
            name="Watch One",
            price=1000,
            brand="BrandA",
            type="Classic",
            description="First watch",
            quantity=20,
            image="watch1.jpg"
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("1000.00"),
            name="Test User",
            address="Test Address",
            pincode="682001",
            phone="9876543210",
            razorpay_order_id="order_test_123"
        )

        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            price=Decimal("1000.00"),
            quantity=1
        )

        self.payment = Payments.objects.create(
            user=self.user,
            order=self.order,
            total_amount=Decimal("1000.00"),
            payment_status="pending",
            payment_method="onlinepayment"
        )

        Cart.objects.create(user=self.user, product=self.product, quantity=1)

    def test_verify_payment_success(self):
        razorpay_payment_id = "pay_test_123"

        signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode(),
            msg=f"{self.order.razorpay_order_id}|{razorpay_payment_id}".encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        payload = {
            "razorpay_order_id": self.order.razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": signature,
            "order_id": self.order.id
        }

        request = self.factory.post("/payment/verifypayment/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Payment verified successfully")

        self.payment.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(self.payment.payment_status, "completed")
        self.assertEqual(self.order.razorpay_payment_id, razorpay_payment_id)
        self.assertEqual(self.order.razorpay_signature, signature)
        self.assertEqual(Cart.objects.filter(user=self.user).count(), 0)

    def test_verify_payment_missing_fields(self):
        request = self.factory.post("/payment/verifypayment/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "All payment verification fields are required")

    def test_verify_payment_not_found(self):
        payload = {
            "razorpay_order_id": "order_test_123",
            "razorpay_payment_id": "pay_test_123",
            "razorpay_signature": "wrong",
            "order_id": 999
        }

        request = self.factory.post("/payment/verifypayment/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Payment record not found")

    def test_verify_payment_invalid_razorpay_order_id(self):
        payload = {
            "razorpay_order_id": "wrong_order_id",
            "razorpay_payment_id": "pay_test_123",
            "razorpay_signature": "wrong",
            "order_id": self.order.id
        }

        request = self.factory.post("/payment/verifypayment/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Invalid Razorpay order id")

    def test_verify_payment_failed_signature(self):
        payload = {
            "razorpay_order_id": self.order.razorpay_order_id,
            "razorpay_payment_id": "pay_test_123",
            "razorpay_signature": "wrong_signature",
            "order_id": self.order.id
        }

        request = self.factory.post("/payment/verifypayment/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Payment verification failed")

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.payment_status, "failed")

    def test_verify_payment_unauthorized(self):
        payload = {
            "razorpay_order_id": self.order.razorpay_order_id,
            "razorpay_payment_id": "pay_test_123",
            "razorpay_signature": "wrong_signature",
            "order_id": self.order.id
        }

        request = self.factory.post("/payment/verifypayment/", payload, format="json")
        response = VerifyPayment.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderedItemsViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        self.other_user = Users.objects.create_user(
            email="other@example.com",
            password="Test@1234",
            name="Other User",
            is_active=True,
            role="user"
        )

        self.product = Products.objects.create(
            name="Watch One",
            price=1000,
            brand="BrandA",
            type="Classic",
            description="First watch",
            quantity=20,
            image="watch1.jpg"
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("1000.00"),
            name="Test User",
            address="Test Address",
            pincode="682001",
            phone="9876543210"
        )

        self.other_order = Order.objects.create(
            user=self.other_user,
            total_amount=Decimal("2000.00"),
            name="Other User",
            address="Other Address",
            pincode="682002",
            phone="9876543211"
        )

        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            price=Decimal("1000.00"),
            quantity=1
        )

        OrderItem.objects.create(
            order=self.other_order,
            product=self.product,
            price=Decimal("1000.00"),
            quantity=2
        )

        Payments.objects.create(
            user=self.user,
            order=self.order,
            total_amount=Decimal("1000.00"),
            payment_status="completed",
            payment_method="cod"
        )

    def test_ordered_items_get_only_user_items(self):
        request = self.factory.get("/payment/ordereditems/")
        force_authenticate(request, user=self.user)
        response = OrderedItems.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_ordered_items_unauthorized(self):
        request = self.factory.get("/payment/ordereditems/")
        response = OrderedItems.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)