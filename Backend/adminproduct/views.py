from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser 
from products.models import Products 
from .serializers import ProductSerializer
from drf_spectacular.utils import extend_schema,OpenApiParameter,OpenApiResponse

# Create your views here.
class SingleProduct(APIView):
    permission_classes=[IsAdminUser]
    @extend_schema(
        tags=["Admin Products"],
        summary="Get single product",
        description="Retrieve one product by its ID.",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Product ID")
        ],
        responses={
            200: ProductSerializer,
            400: OpenApiResponse(description="Product does not exist"),
        },
    )
    def get(self,request,id):
        try:
            product = Products.objects.get(id=id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product does not exist"
            },status=status.HTTP_400_BAD_REQUEST)
        serializer = ProductSerializer(product)
        return Response(serializer.data,status=status.HTTP_200_OK)
class DeleteProduct(APIView):
    permission_classes=[IsAdminUser]
    @extend_schema(
        tags=["Admin Products"],
        summary="Delete product",
        description="Delete a product by its ID.",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Product ID")
        ],
        responses={
            200: OpenApiResponse(description="Product deleted successfully"),
            400: OpenApiResponse(description="Product does not exist"),
        },
    )
    def delete(self,request,id):
        try:
            product = Products.objects.get(id=id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not Exist"
            },status=status.HTTP_400_BAD_REQUEST)
        product.delete()
        return Response({
            "message":"Product Deleted Successfully"
        },status=status.HTTP_200_OK)
        
class AddProducts(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = ProductSerializer
    @extend_schema(
        tags=["Admin Products"],
        summary="Add product",
        description="Create a new product.",
        request=ProductSerializer,
        responses={
            201: OpenApiResponse(description="Product added successfully"),
            400: OpenApiResponse(description="Validation failed"),
        },
    )
    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message":"Product added successfully"
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class EditProducts(APIView):
    permission_classes =[IsAdminUser]
    @extend_schema(
        tags=["Admin Products"],
        summary="Edit product",
        description="Update an existing product by its ID.",
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH, description="Product ID")
        ],
        request=ProductSerializer,
        responses={
            200: OpenApiResponse(description="Product modified successfully"),
            400: OpenApiResponse(description="Product does not exist or validation failed"),
        },
    )
    def put(self,request,id):
        try:
            product = Products.objects.get(id=id)
        except Products.DoesNotExist:
            return Response({
                "message":"Product Does not Exist"
            },status=status.HTTP_400_BAD_REQUEST)
        serializer = ProductSerializer(product,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message":"Product Modified Successfully"
            },status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)