from decimal import Decimal
from django.db import IntegrityError
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from accounts.models import Users
from .models import Wallet, WalletTransaction
from .views import WalletDetail


class WalletModelTests(TestCase):
    def setUp(self):
        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        # wallet may already be auto-created by signal / post_save
        self.wallet, _ = Wallet.objects.get_or_create(user=self.user)

    def test_wallet_creation(self):
        self.wallet.balance = Decimal("1500.00")
        self.wallet.save()

        self.assertEqual(self.wallet.user, self.user)
        self.assertEqual(self.wallet.balance, Decimal("1500.00"))
        self.assertEqual(str(self.wallet), f"{self.user} - 1500.00")

    def test_wallet_default_balance(self):
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_wallet_one_to_one_user(self):
        with self.assertRaises(IntegrityError):
            Wallet.objects.create(
                user=self.user,
                balance=Decimal("200.00")
            )

    def test_wallet_transaction_credit_creation(self):
        self.wallet.balance = Decimal("1000.00")
        self.wallet.save()

        transaction = WalletTransaction.objects.create(
            wallet=self.wallet,
            transaction_type="credit",
            amount=Decimal("500.00")
        )

        self.assertEqual(transaction.wallet, self.wallet)
        self.assertEqual(transaction.transaction_type, "credit")
        self.assertEqual(transaction.amount, Decimal("500.00"))
        self.assertEqual(
            str(transaction),
            f"{self.user.email} - credit - 500.00"
        )

    def test_wallet_transaction_debit_creation(self):
        self.wallet.balance = Decimal("2000.00")
        self.wallet.save()

        transaction = WalletTransaction.objects.create(
            wallet=self.wallet,
            transaction_type="debit",
            amount=Decimal("750.00")
        )

        self.assertEqual(transaction.wallet, self.wallet)
        self.assertEqual(transaction.transaction_type, "debit")
        self.assertEqual(transaction.amount, Decimal("750.00"))
        self.assertEqual(
            str(transaction),
            f"{self.user.email} - debit - 750.00"
        )


class WalletDetailViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user"
        )

        # wallet may already be auto-created
        self.wallet, _ = Wallet.objects.get_or_create(user=self.user)

    def test_wallet_detail_get_existing_wallet(self):
        self.wallet.balance = Decimal("2500.00")
        self.wallet.save()

        request = self.factory.get("/wallet/")
        force_authenticate(request, user=self.user)
        response = WalletDetail.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Wallet.objects.filter(user=self.user).count(), 1)

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("2500.00"))

        self.assertIn("balance", response.data)
        self.assertEqual(Decimal(str(response.data["balance"])), Decimal("2500.00"))

    def test_wallet_detail_creates_wallet_if_not_exists(self):
        # if wallet is auto-created by signal, just delete it first
        Wallet.objects.filter(user=self.user).delete()
        self.assertEqual(Wallet.objects.filter(user=self.user).count(), 0)

        request = self.factory.get("/wallet/")
        force_authenticate(request, user=self.user)
        response = WalletDetail.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Wallet.objects.filter(user=self.user).count(), 1)

        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("0.00"))

        self.assertIn("balance", response.data)
        self.assertEqual(Decimal(str(response.data["balance"])), Decimal("0.00"))

    def test_wallet_detail_unauthorized(self):
        request = self.factory.get("/wallet/")
        response = WalletDetail.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)