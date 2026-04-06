from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from accounts.models import Users
from products.models import Products
from payment.models import Order, Payments
from wallet.models import Wallet, WalletTransaction
from .views import OrderList, StatusUpdate


class OrderListAndStatusUpdateTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.admin = Users.objects.create_user(
            email="admin@example.com",
            password="Admin@1234",
            name="Admin User",
            role="admin",
            is_staff=True,
            is_superuser=True,
            is_active=True
        )

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="User@1234",
            name="Normal User",
            role="user",
            is_active=True
        )

        self.product = Products.objects.create(
            name="Watch One",
            price=1000,
            brand="BrandA",
            type="Classic",
            description="Test watch",
            quantity=10,
            image="watch.jpg"
        )

        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("2500.00"),
            name="Normal User",
            address="Test Address",
            pincode="682001",
            phone="9876543210"
        )

        self.payment = Payments.objects.create(
            user=self.user,
            order=self.order,
            total_amount=Decimal("2500.00"),
            payment_status="completed",
            payment_method="onlinepayment"
        )

    # ---------------- ORDER LIST ----------------
    def test_order_list_success(self):
        request = self.factory.get("/orderlist/")
        response = OrderList.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # ---------------- STATUS UPDATE ----------------
    def test_status_update_success_without_refund(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"status": "failed"},
            format="json"
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.payment_status, "failed")

    def test_status_update_payment_not_found(self):
        request = self.factory.patch(
            "/orderlist/status/999/",
            {"status": "failed"},
            format="json"
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_status_update_status_required(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {},
            format="json"
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_update_refund_creates_wallet(self):
        Wallet.objects.filter(user=self.user).delete()

        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"status": "refunded"},
            format="json"
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("2500.00"))

        self.assertEqual(WalletTransaction.objects.count(), 1)

    def test_status_update_refund_existing_wallet(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.user)
        wallet.balance = Decimal("1000.00")
        wallet.save()

        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"status": "refunded"},
            format="json"
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        wallet.refresh_from_db()
        self.assertEqual(wallet.balance, Decimal("3500.00"))

    def test_status_update_non_admin_forbidden(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"status": "failed"},
            format="json"
        )
        force_authenticate(request, user=self.user)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_status_update_unauthorized(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"status": "failed"},
            format="json"
        )
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)