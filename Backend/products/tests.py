from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from accounts.models import Users
from .models import Products, Cart, Wishlist
from .views import (
    productsPage,
    AddCart,
    Cartitems,
    AddQuantity,
    RemoveItem,
    AddtoWishlist,
    WishlistItem,
    RemoveWishItem,
    CartCount,
    WishCount,
    ProductView,
)


class ProductModelTests(TestCase):
    def setUp(self):
        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user",
        )

        self.product = Products.objects.create(
            name="Rolex",
            price=5000,
            brand="Rolex Brand",
            type="Luxury",
            description="Luxury watch",
            quantity=10,
            image="sample.jpg",
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Rolex")
        self.assertEqual(self.product.price, 5000)
        self.assertEqual(self.product.brand, "Rolex Brand")
        self.assertEqual(self.product.type, "Luxury")
        self.assertEqual(self.product.description, "Luxury watch")
        self.assertEqual(self.product.quantity, 10)

    def test_product_str(self):
        self.assertEqual(str(self.product), "Rolex")

    def test_cart_creation(self):
        cart = Cart.objects.create(
            user=self.user,
            product=self.product,
            quantity=2,
        )

        self.assertEqual(cart.user, self.user)
        self.assertEqual(cart.product, self.product)
        self.assertEqual(cart.quantity, 2)
        self.assertEqual(str(cart), f"{self.user} - {self.product.name}")

    def test_wishlist_creation(self):
        wishlist = Wishlist.objects.create(
            user=self.user,
            product=self.product,
        )

        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.product, self.product)
        self.assertEqual(str(wishlist), f"{self.user} - {self.product}")


class ProductViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.user = Users.objects.create_user(
            email="user@example.com",
            password="Test@1234",
            name="Test User",
            is_active=True,
            role="user",
        )

        self.other_user = Users.objects.create_user(
            email="other@example.com",
            password="Test@1234",
            name="Other User",
            is_active=True,
            role="user",
        )

        self.product1 = Products.objects.create(
            name="Rolex",
            price=5000,
            brand="Rolex Brand",
            type="Luxury",
            description="Luxury watch",
            quantity=10,
            image="sample1.jpg",
        )

        self.product2 = Products.objects.create(
            name="Casio",
            price=2000,
            brand="Casio Brand",
            type="Sports",
            description="Sports watch",
            quantity=5,
            image="sample2.jpg",
        )

    def test_products_page_get(self):
        request = self.factory.get("/products/")
        response = productsPage.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_add_cart_success(self):
        request = self.factory.post(
            "/products/addcart/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddCart.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "product added to cart")

        cart_item = Cart.objects.get(user=self.user, product=self.product1)
        self.assertEqual(cart_item.quantity, 1)

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.quantity, 9)

    def test_add_cart_quantity_increase(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)

        request = self.factory.post(
            "/products/addcart/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddCart.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product quantity increased")

        cart_item = Cart.objects.get(user=self.user, product=self.product1)
        self.assertEqual(cart_item.quantity, 2)

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.quantity, 9)

    def test_add_cart_missing_product_id(self):
        request = self.factory.post("/products/addcart/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = AddCart.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "product_id is needed ")

    def test_add_cart_product_not_found(self):
        request = self.factory.post(
            "/products/addcart/",
            {"product_id": 999},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddCart.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "product Does not Exist")

    def test_add_cart_out_of_stock(self):
        self.product1.quantity = 0
        self.product1.save()

        request = self.factory.post(
            "/products/addcart/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddCart.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], f"{self.product1.name} is out of stock !")

    def test_cart_items_view(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=2)

        request = self.factory.get("/products/cartitems/")
        force_authenticate(request, user=self.user)
        response = Cartitems.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Rolex")
        self.assertEqual(response.data[0]["quantity"], 2)
        self.assertEqual(response.data[0]["product_id"], self.product1.id)
        self.assertEqual(response.data[0]["price"], 5000)
        self.assertEqual(response.data[0]["total"], 10000)

    def test_add_quantity_increase_success(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)

        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": 3},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Inventory Synced")
        self.assertEqual(response.data["quantity"], 3)

        cart_item = Cart.objects.get(user=self.user, product=self.product1)
        self.assertEqual(cart_item.quantity, 3)

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.quantity, 8)

    def test_add_quantity_decrease_success(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=3)
        self.product1.quantity = 7
        self.product1.save()

        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": 1},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Inventory Synced")
        self.assertEqual(response.data["quantity"], 1)

        cart_item = Cart.objects.get(user=self.user, product=self.product1)
        self.assertEqual(cart_item.quantity, 1)

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.quantity, 9)

    def test_add_quantity_invalid_quantity(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)

        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": "abc"},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Invalid Quantity")

    def test_add_quantity_less_than_one(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)

        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": 0},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Quantity must be at least 1")

    def test_add_quantity_product_not_found(self):
        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": 999, "quantity": 2},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product not found")

    def test_add_quantity_cart_item_not_found(self):
        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": 2},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Cart item not found")

    def test_add_quantity_not_enough_stock(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)
        self.product1.quantity = 1
        self.product1.save()

        request = self.factory.patch(
            "/products/addquantity/",
            {"product_id": self.product1.id, "quantity": 5},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddQuantity.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only", response.data["message"])

    def test_remove_cart_item_success(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=2)
        self.product1.quantity = 8
        self.product1.save()

        request = self.factory.post(
            "/products/removeitem/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = RemoveItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Item Removed From Cart")
        self.assertFalse(Cart.objects.filter(user=self.user, product=self.product1).exists())

        self.product1.refresh_from_db()
        self.assertEqual(self.product1.quantity, 10)

    def test_remove_cart_item_missing_product_id(self):
        request = self.factory.post("/products/removeitem/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = RemoveItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product_id Required")

    def test_remove_cart_item_product_not_found(self):
        request = self.factory.post(
            "/products/removeitem/",
            {"product_id": 999},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = RemoveItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Product Does not Exist")

    def test_remove_cart_item_cart_not_found(self):
        request = self.factory.post(
            "/products/removeitem/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = RemoveItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Cart Does not Exist")

    def test_add_to_wishlist_success(self):
        request = self.factory.post(
            "/products/addtowishlist/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddtoWishlist.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Added to Wishlist")
        self.assertTrue(Wishlist.objects.filter(user=self.user, product=self.product1).exists())

    def test_add_to_wishlist_toggle_remove(self):
        Wishlist.objects.create(user=self.user, product=self.product1)

        request = self.factory.post(
            "/products/addtowishlist/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddtoWishlist.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Removed From Wishlist")
        self.assertFalse(Wishlist.objects.filter(user=self.user, product=self.product1).exists())

    def test_add_to_wishlist_missing_product_id(self):
        request = self.factory.post("/products/addtowishlist/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = AddtoWishlist.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product_id needed")

    def test_add_to_wishlist_product_not_found(self):
        request = self.factory.post(
            "/products/addtowishlist/",
            {"product_id": 999},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = AddtoWishlist.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Product Does not exist")

    def test_wishlist_items_view(self):
        Wishlist.objects.create(user=self.user, product=self.product1)

        request = self.factory.get("/products/wishlist/")
        force_authenticate(request, user=self.user)
        response = WishlistItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Rolex")
        self.assertEqual(response.data[0]["price"], 5000)
        self.assertEqual(response.data[0]["product_id"], self.product1.id)

    def test_remove_wishlist_item_success(self):
        Wishlist.objects.create(user=self.user, product=self.product1)

        request = self.factory.delete(
            "/products/removewishlist/",
            {"product_id": self.product1.id},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = RemoveWishItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Wishlist Removed")
        self.assertFalse(Wishlist.objects.filter(user=self.user, product=self.product1).exists())

    def test_remove_wishlist_item_missing_product_id(self):
        request = self.factory.delete("/products/removewishlist/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = RemoveWishItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Product_id needed")

    def test_remove_wishlist_item_product_not_found(self):
        request = self.factory.delete(
            "/products/removewishlist/",
            {"product_id": 999},
            format="json",
        )
        force_authenticate(request, user=self.user)
        response = RemoveWishItem.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Product Does not Exist")

    def test_cart_count(self):
        Cart.objects.create(user=self.user, product=self.product1, quantity=1)
        Cart.objects.create(user=self.user, product=self.product2, quantity=1)

        request = self.factory.get("/products/cartcount/")
        force_authenticate(request, user=self.user)
        response = CartCount.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cart_count"], 2)

    def test_wish_count(self):
        Wishlist.objects.create(user=self.user, product=self.product1)
        Wishlist.objects.create(user=self.user, product=self.product2)

        request = self.factory.get("/products/wishcount/")
        force_authenticate(request, user=self.user)
        response = WishCount.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["wish_count"], 2)

    def test_product_view_success(self):
        request = self.factory.get(f"/products/{self.product1.id}/")
        force_authenticate(request, user=self.user)
        response = ProductView.as_view()(request, id=self.product1.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_product_view_not_found(self):
        request = self.factory.get("/products/999/")
        force_authenticate(request, user=self.user)
        response = ProductView.as_view()(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "Product Does not Exist")