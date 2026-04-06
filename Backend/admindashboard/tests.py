from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from accounts.models import Users
from payment.models import Order, Payments
from .views import TotalUsers, ActiveUsers, BlockedUsers, TotalOrders, TotalRevenue


class DashboardViewTests(TestCase):
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

        self.user1 = Users.objects.create_user(
            email="user1@example.com",
            password="User@1234",
            name="User One",
            role="user",
            is_active=True
        )

        self.user2 = Users.objects.create_user(
            email="user2@example.com",
            password="User@1234",
            name="User Two",
            role="user",
            is_active=True
        )

        self.user3 = Users.objects.create_user(
            email="user3@example.com",
            password="User@1234",
            name="User Three",
            role="user",
            is_active=False
        )

        self.order1 = Order.objects.create(
            user=self.user1,
            total_amount=Decimal("1000.00"),
            name="User One",
            address="Address 1",
            pincode="682001",
            phone="9876543210"
        )

        self.order2 = Order.objects.create(
            user=self.user2,
            total_amount=Decimal("2000.00"),
            name="User Two",
            address="Address 2",
            pincode="682002",
            phone="9876543211"
        )

        Payments.objects.create(
            user=self.user1,
            order=self.order1,
            total_amount=Decimal("1000.00"),
            payment_status="completed",
            payment_method="cod"
        )

        Payments.objects.create(
            user=self.user2,
            order=self.order2,
            total_amount=Decimal("2000.00"),
            payment_status="pending",
            payment_method="onlinepayment"
        )

    def test_total_users_admin(self):
        request = self.factory.get("/dashboard/totalusers/")
        force_authenticate(request, user=self.admin)
        response = TotalUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 3)

    def test_active_users_admin(self):
        request = self.factory.get("/dashboard/activeusers/")
        force_authenticate(request, user=self.admin)
        response = ActiveUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 2)

    def test_blocked_users_admin(self):
        request = self.factory.get("/dashboard/blockedusers/")
        force_authenticate(request, user=self.admin)
        response = BlockedUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 1)

    def test_total_orders_admin(self):
        request = self.factory.get("/dashboard/totalorders/")
        force_authenticate(request, user=self.admin)
        response = TotalOrders.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 2)

    def test_total_revenue_admin(self):
        request = self.factory.get("/dashboard/totalrevenue/")
        force_authenticate(request, user=self.admin)
        response = TotalRevenue.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, Decimal("1000.00"))

    def test_total_revenue_zero_when_no_completed_payments(self):
        Payments.objects.all().delete()

        request = self.factory.get("/dashboard/totalrevenue/")
        force_authenticate(request, user=self.admin)
        response = TotalRevenue.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 0)

    def test_total_users_forbidden_for_normal_user(self):
        request = self.factory.get("/dashboard/totalusers/")
        force_authenticate(request, user=self.user1)
        response = TotalUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_active_users_forbidden_for_normal_user(self):
        request = self.factory.get("/dashboard/activeusers/")
        force_authenticate(request, user=self.user1)
        response = ActiveUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_blocked_users_forbidden_for_normal_user(self):
        request = self.factory.get("/dashboard/blockedusers/")
        force_authenticate(request, user=self.user1)
        response = BlockedUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_total_orders_forbidden_for_normal_user(self):
        request = self.factory.get("/dashboard/totalorders/")
        force_authenticate(request, user=self.user1)
        response = TotalOrders.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_total_revenue_forbidden_for_normal_user(self):
        request = self.factory.get("/dashboard/totalrevenue/")
        force_authenticate(request, user=self.user1)
        response = TotalRevenue.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_total_users_unauthorized(self):
        request = self.factory.get("/dashboard/totalusers/")
        response = TotalUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_active_users_unauthorized(self):
        request = self.factory.get("/dashboard/activeusers/")
        response = ActiveUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_blocked_users_unauthorized(self):
        request = self.factory.get("/dashboard/blockedusers/")
        response = BlockedUsers.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_total_orders_unauthorized(self):
        request = self.factory.get("/dashboard/totalorders/")
        response = TotalOrders.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_total_revenue_unauthorized(self):
        request = self.factory.get("/dashboard/totalrevenue/")
        response = TotalRevenue.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)