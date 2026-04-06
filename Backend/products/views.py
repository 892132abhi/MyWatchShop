from rest_framework.views import  APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Products,Cart,Wishlist
from .Serializers import ProductSerializer
from accounts.models import Users
from rest_framework.permissions import IsAuthenticated
import json
# Create your views here.

class productsPage(APIView):
    def get(self,request):
        products = Products.objects.all()
        serializers = ProductSerializer(products,many=True)
        return Response(serializers.data,status=status.HTTP_200_OK)
    
class AddCart(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        user = request.user
        product_id=request.data.get('product_id')
        
        if not product_id:
            return Response({
                "message":"product_id is needed ",
                
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Products.objects.get(id=product_id)
        
        except Products.DoesNotExist:
            return Response({
                "message":"product Does not Exist",
            },status=status.HTTP_404_NOT_FOUND)
        if product.quantity <1:
            return Response({
                "message":f"{product.name} is out of stock !"
            },status=status.HTTP_400_BAD_REQUEST)
        cart_item = Cart.objects.filter(user=user,product=product).first()
        if cart_item:
            cart_item.quantity+=1
            cart_item.save()
            
            product.quantity -=1
            product.save()
            return Response({
                "message":"Product quantity increased",
                "quantity":cart_item.quantity,
                "stock":product.quantity
            }
            ,status=status.HTTP_200_OK
            )
        cart_item = Cart.objects.create(
            user = user,
            product=product,
            quantity=1
        )
        product.quantity -=1
        product.save()
        return Response({
            "message":"product added to cart",
            "stock":product.quantity
        },status=status.HTTP_201_CREATED)
class Cartitems(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        cart_items=Cart.objects.filter(user=user).select_related('product')
        data =[]
        for i in cart_items:
            data.append({
              "id":i.id,
              "quantity":i.quantity,
              "product_id":i.product.id,
              "name":i.product.name,
              "price":i.product.price,
              "image":i.product.image.url if i.product.image else None,
              "total":i.quantity*i.product.price
            })
        return Response(data,status=status.HTTP_200_OK)
class AddQuantity(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        user = request.user
        print("CONTENT TYPE:", request.content_type)
        if request.content_type == 'text/plain':
            try:
                payload = json.loads(request.body.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                return Response({"message": "Invalid request body"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            payload = request.data

        product_id = payload.get('product_id')
        new_quantity = payload.get('quantity')

        try:
            target_qty = int(new_quantity)
            product = Products.objects.get(id=product_id)
            cart_item = Cart.objects.get(user=user, product=product)
        except (TypeError, ValueError):
            return Response({"message": "Invalid Quantity"}, status=status.HTTP_400_BAD_REQUEST)
        except Products.DoesNotExist:
            return Response({"message": "Product not found"})
        except Cart.DoesNotExist:
            return Response({"message": "Cart item not found"})

        if target_qty < 1:
            return Response({"message": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate the difference
        # If difference is positive (e.g., 5 - 4 = 1), user added an item.
        # If difference is negative (e.g., 3 - 4 = -1), user removed an item.
        difference = target_qty - cart_item.quantity

        if difference > 0:
            # User clicked '+'. Check if master inventory has enough stock.
            if product.quantity < difference:
                return Response({
                    "message": f"Only {product.quantity} more units available in stock.",
                    "current_cart_qty": cart_item.quantity
                }, status=status.HTTP_400_BAD_REQUEST)
            
            product.quantity -= difference # Subtract from inventory
        else:
            # User clicked '-'. Add the difference back to master inventory.
            # (Remember: difference is negative here, so we subtract it to add it)
            product.quantity -= difference 

        # Save both
        cart_item.quantity = target_qty
        cart_item.save()
        product.save()

        return Response({
            "message": "Inventory Synced",
            "quantity": cart_item.quantity,
            "remaining_stock": product.quantity
        }, status=status.HTTP_200_OK)
        

class RemoveItem(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        user = request.user
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({
                "message":"Product_id Required"
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not Exist"
            },status=status.HTTP_404_NOT_FOUND)
        try:
            cart_item = Cart.objects.get(user=user,product=product)
        except Cart.DoesNotExist:
            return Response({
                "message":"Cart Does not Exist"
            },status=status.HTTP_400_BAD_REQUEST)
        product.quantity += cart_item.quantity
        product.save()
        cart_item.delete()
        return Response({
            "message":"Item Removed From Cart"
        },status=status.HTTP_200_OK)


class AddtoWishlist(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        print("CONTENT TYPE:", request.content_type)
        user = request.user
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({
                "message":"Product_id needed"
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not exist"
            },status=status.HTTP_404_NOT_FOUND)
        wishlist_item = Wishlist.objects.filter(user=user,product=product).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response({
                "message":"Removed From Wishlist"
            },status=status.HTTP_200_OK)
        Wishlist.objects.create(
            user=user,
            product=product,
        )
        return Response({
            "message":"Added to Wishlist"
        },status=status.HTTP_201_CREATED)

class WishlistItem(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        wishlist_items = Wishlist.objects.filter(user=user).select_related('product')
        data =[]
        for i in wishlist_items:
            data.append({
                "id":i.id,
                "product_id":i.product.id,
                "name":i.product.name,
                "price":i.product.price,
                "image":i.product.image.url if i.product.image else None,
                "description":i.product.description
            })
        return Response(data,status=status.HTTP_200_OK)
    
class RemoveWishItem(APIView):
    permission_classes=[IsAuthenticated]
    def delete(self,request):
        user = request.user
        product_id=request.data.get('product_id')
        if not product_id:
            return Response({
                "message":"Product_id needed"
            },status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not Exist"
            },status=status.HTTP_404_NOT_FOUND)
        try:
            wish_item = Wishlist.objects.filter(user = user,product=product).first()
        except Wishlist.DoesNotExist:
            return Response({
                "message":"Wishlist Not Exist"
            },status=status.HTTP_404_BAD_REQUEST)
        wish_item.delete()
        return Response({
            "message":"Wishlist Removed"
        },status=status.HTTP_200_OK)
        
class CartCount(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        cart_count = Cart.objects.filter(user=user).count()
        return Response({
            "cart_count":cart_count
        },status=status.HTTP_200_OK)
        
class WishCount(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user = request.user
        wish_count = Wishlist.objects.filter(user=user).count()
        return Response({
            "wish_count":wish_count
        },status=status.HTTP_200_OK)
        
class ProductView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,id):
        try:
            product = Products.objects.get(id=id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not Exist"
            },status=status.HTTP_404_NOT_FOUND)        
        serializer = ProductSerializer(product)
        return Response(serializer.data,status=status.HTTP_200_OK)
