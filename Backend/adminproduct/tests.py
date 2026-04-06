from io import BytesIO
from unittest.mock import MagicMock, patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Users
from products.models import Products
from .views import SingleProduct, DeleteProduct, AddProducts, EditProducts


def get_test_image():
    file = BytesIO()
    image = Image.new("RGB", (100, 100), "white")
    image.save(file, "jpeg")
    file.seek(0)
    return SimpleUploadedFile(
        "test.jpg",
        file.read(),
        content_type="image/jpeg"
    )


class AdminProductViewTests(TestCase):
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

        self.product = Products.objects.create(
            name="Rolex",
            price=5000,
            brand="Rolex Brand",
            type="Luxury",
            description="Luxury watch",
            quantity=10,
            image=get_test_image(),
        )

    def test_single_product_success(self):
        request = self.factory.get(f"/product/{self.product.id}/")
        force_authenticate(request, user=self.admin)
        response = SingleProduct.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_single_product_not_found(self):
        request = self.factory.get("/product/999/")
        force_authenticate(request, user=self.admin)
        response = SingleProduct.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product does not exist")

    def test_single_product_non_admin_forbidden(self):
        request = self.factory.get(f"/product/{self.product.id}/")
        force_authenticate(request, user=self.user)
        response = SingleProduct.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_single_product_unauthorized(self):
        request = self.factory.get(f"/product/{self.product.id}/")
        response = SingleProduct.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_product_success(self):
        request = self.factory.delete(f"/product/delete/{self.product.id}/")
        force_authenticate(request, user=self.admin)
        response = DeleteProduct.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product Deleted Successfully")
        self.assertFalse(Products.objects.filter(id=self.product.id).exists())

    def test_delete_product_not_found(self):
        request = self.factory.delete("/product/delete/999/")
        force_authenticate(request, user=self.admin)
        response = DeleteProduct.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product Does not Exist")

    def test_delete_product_non_admin_forbidden(self):
        request = self.factory.delete(f"/product/delete/{self.product.id}/")
        force_authenticate(request, user=self.user)
        response = DeleteProduct.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_product_success(self):
        payload = {
            "name": "Casio",
            "price": 2000,
            "brand": "Casio",
            "type": "Sports",
            "description": "Good watch",
            "quantity": 5,
            "image": get_test_image(),
        }

        request = self.factory.post("/product/add/", payload, format="multipart")
        force_authenticate(request, user=self.admin)
        response = AddProducts.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Product added successfully")
        self.assertTrue(Products.objects.filter(name="Casio").exists())

    @patch("adminproduct.views.ProductSerializer")
    def test_add_product_invalid_data(self, mock_serializer_class):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {
            "name": ["This field is required."],
            "price": ["This field is required."],
        }
        mock_serializer_class.return_value = mock_serializer

        request = self.factory.post("/product/add/", {}, format="json")
        force_authenticate(request, user=self.admin)
        response = AddProducts.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)
        self.assertEqual(str(response.data["name"][0]), "This field is required.")

    def test_add_product_non_admin_forbidden(self):
        request = self.factory.post("/product/add/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = AddProducts.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("adminproduct.views.ProductSerializer")
    def test_edit_product_success(self, mock_serializer_class):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mock_serializer_class.return_value = mock_serializer

        payload = {
            "name": "Updated Rolex",
            "price": 7000,
        }

        request = self.factory.put(
            f"/product/edit/{self.product.id}/",
            payload,
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = EditProducts.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product Modified Successfully")
        mock_serializer.is_valid.assert_called_once()
        mock_serializer.save.assert_called_once()

    def test_edit_product_not_found(self):
        request = self.factory.put(
            "/product/edit/999/",
            {"name": "Updated"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = EditProducts.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product Does not Exist")

    @patch("adminproduct.views.ProductSerializer")
    def test_edit_product_invalid_data(self, mock_serializer_class):
        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {"price": ["A valid integer is required."]}
        mock_serializer_class.return_value = mock_serializer

        request = self.factory.put(
            f"/product/edit/{self.product.id}/",
            {"price": "abc"},
            format="json",
        )
        force_authenticate(request, user=self.admin)
        response = EditProducts.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price", response.data)
        self.assertEqual(str(response.data["price"][0]), "A valid integer is required.")

    def test_edit_product_non_admin_forbidden(self):
        request = self.factory.put(
            f"/product/edit/{self.product.id}/",
            {"name": "Updated"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = EditProducts.as_view()(request, id=self.product.id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)