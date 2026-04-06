from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser 
from products.models import Products 
from .serializers import ProductSerializer

# Create your views here.
class SingleProduct(APIView):
    permission_classes=[IsAdminUser]
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
    def post(self,request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message":"Product added successfully"
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class EditProducts(APIView):
    permission_classes =[IsAdminUser]
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