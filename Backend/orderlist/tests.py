from decimal import Decimal

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Users
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
            is_active=True,
        )

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="User@1234",
            name="Normal User",
            role="user",
            is_active=True,
        )

        # Use the field names that match your actual model.
        # If your Order model uses o_user / o_total_amount, replace these accordingly.
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("2500.00"),
            name="Normal User",
            address="Test Address",
            pincode="682001",
            phone="9876543210",
        )

        self.payment = Payments.objects.create(
            user=self.user,
            order=self.order,
            total_amount=Decimal("2500.00"),
            payment_status="completed",
            payment_method="onlinepayment",
        )

    # ---------------- ORDER LIST ----------------

    def test_order_list_success(self):
        request = self.factory.get("/orderlist/")
        force_authenticate(request, user=self.admin)
        response = OrderList.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_order_list_non_admin_forbidden(self):
        request = self.factory.get("/orderlist/")
        force_authenticate(request, user=self.user)
        response = OrderList.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_order_list_unauthorized(self):
        request = self.factory.get("/orderlist/")
        response = OrderList.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ---------------- STATUS UPDATE ----------------

    def test_status_update_success_without_refund(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"new_status": "failed"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Order Status Updated")

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.payment_status, "failed")

    def test_status_update_payment_not_found(self):
        request = self.factory.patch(
            "/orderlist/status/999/",
            {"new_status": "failed"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Order Does not Exist")

    def test_status_update_status_required(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Status is Required")

    def test_status_update_refund_creates_wallet(self):
        Wallet.objects.filter(user=self.user).delete()

        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"new_status": "refunded"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Order Status Updated")

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.payment_status, "refunded")

        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("2500.00"))

        self.assertEqual(WalletTransaction.objects.count(), 1)
        transaction = WalletTransaction.objects.first()
        self.assertEqual(transaction.transaction_type, "credit")
        self.assertEqual(transaction.amount, Decimal("2500.00"))
        self.assertEqual(transaction.description, f"Refund for order {self.order.id}")

    def test_status_update_refund_existing_wallet(self):
        wallet, _ = Wallet.objects.get_or_create(
            user=self.user,
            defaults={"balance": Decimal("0.00")}
        )
        wallet.balance = Decimal("1000.00")
        wallet.save()

        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"new_status": "refunded"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        wallet.refresh_from_db()
        self.assertEqual(wallet.balance, Decimal("3500.00"))

    def test_status_update_non_admin_forbidden(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"new_status": "failed"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_status_update_unauthorized(self):
        request = self.factory.patch(
            f"/orderlist/status/{self.payment.id}/",
            {"new_status": "failed"},
            format="json",
        )
        response = StatusUpdate.as_view()(request, id=self.payment.id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)