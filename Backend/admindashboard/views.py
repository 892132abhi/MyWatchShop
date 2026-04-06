from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from accounts.models import Users
# from accounts.serializers import UserListSerializer
from payment.models import Order,Payments
from django.db.models import Sum
# Create your views here.

class TotalUsers(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        users = Users.objects.filter(role='user').count()
        return Response(users,status=status.HTTP_200_OK)
    
class ActiveUsers(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        users = Users.objects.filter(role='user',is_active=True).count()
        return Response(users,status=status.HTTP_200_OK)
    
class BlockedUsers(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        users = Users.objects.filter(role='user',is_active=False).count()
        return Response(users,status=status.HTTP_200_OK)
        
class TotalOrders(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        orders = Order.objects.all().count()
        return Response(orders,status=status.HTTP_200_OK)
    
class TotalRevenue(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request):
        revenue = (
            Payments.objects.filter(payment_status="completed")
            .aggregate(total=Sum("total_amount"))
        )["total"] or 0

        return Response(revenue, status=status.HTTP_200_OK)
