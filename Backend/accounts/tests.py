from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_success(self):
        user = User.objects.create_user(
            email="abhiram@example.com",
            password="Test@1234",
            name="Abhiram"
        )

        self.assertEqual(user.email, "abhiram@example.com")
        self.assertEqual(user.name, "Abhiram")
        self.assertEqual(user.role, "user")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)  # because your manager sets default False
        self.assertTrue(user.check_password("Test@1234"))

    def test_create_user_email_required(self):
        with self.assertRaises(ValueError) as context:
            User.objects.create_user(
                email="",
                password="Test@1234",
                name="No Email User"
            )

        self.assertEqual(str(context.exception), "Email is required")

    def test_create_user_email_normalized(self):
        user = User.objects.create_user(
            email="ABHIRAM@EXAMPLE.COM",
            password="Test@1234",
            name="Abhiram"
        )

        self.assertEqual(user.email, "ABHIRAM@example.com")

    def test_create_user_with_custom_active_true(self):
        user = User.objects.create_user(
            email="activeuser@example.com",
            password="Test@1234",
            name="Active User",
            is_active=True
        )

        self.assertTrue(user.is_active)

    def test_create_superuser_success(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Admin@1234",
            name="Admin User"
        )

        self.assertEqual(admin.email, "admin@example.com")
        self.assertEqual(admin.name, "Admin User")
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)
        self.assertEqual(admin.role, "user")  # your model default is still "user" unless set manually
        self.assertTrue(admin.check_password("Admin@1234"))

    def test_create_superuser_with_admin_role(self):
        admin = User.objects.create_superuser(
            email="realadmin@example.com",
            password="Admin@1234",
            name="Real Admin",
            role="admin"
        )

        self.assertEqual(admin.role, "admin")
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_string_representation(self):
        user = User.objects.create_user(
            email="printme@example.com",
            password="Test@1234",
            name="Print Me"
        )

        self.assertEqual(str(user), "printme@example.com")

    def test_username_is_none(self):
        self.assertIsNone(User.username)

    def test_username_field_is_email(self):
        self.assertEqual(User.USERNAME_FIELD, "email")

    def test_required_fields(self):
        self.assertEqual(User.REQUIRED_FIELDS, ["name"])

    def test_default_role_is_user(self):
        user = User.objects.create_user(
            email="defaultrole@example.com",
            password="Test@1234",
            name="Default Role"
        )

        self.assertEqual(user.role, "user")

    def test_default_is_verified_false(self):
        user = User.objects.create_user(
            email="verifytest@example.com",
            password="Test@1234",
            name="Verify Test"
        )

        self.assertFalse(user.is_verified)