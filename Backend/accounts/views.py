from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Users
from django.contrib.auth import login
from .serializers import RegisterSerializer,LoginSerializer,AdminSerializer,UserListSerializer
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from drf_spectacular.utils import extend_schema


class RegisterPage(APIView):
    serializer_class = RegisterSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)


            activation_link = f"https://my-watch-shop.vercel.app/verify-email/${uid}/${token}"

            subject = "Verify your WatchStore account"
            message = (
                f"Hi {user.name},\n\n"
                f"Please click the link below to verify your email and complete registration:\n\n"
                f"{activation_link}\n\n"
                f"If you did not create this account, you can ignore this email."
            )
            try:
                send_mail(subject, message, settings.EMAIL_HOST_USER,[user.email],fail_silently=False)
            except Exception as e:
                return Response(
                    {
                        "message": "User created, but email could not be sent.",
                        "error": str(e)
                    },
                    status=status.HTTP_201_CREATED
                )

            return Response(
                {
                    "message": "User registered successfully and email sent.",
                    "email": user.email,
                    "name": user.name
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Users.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.is_verified = True
        user.save()
        return HttpResponse("Your account has been verified successfully. You can now log in.")
    else:
        return HttpResponse("Activation link is invalid or expired.")

class VerifyEmail(APIView):
    def post(self,request,uid,token):
        try:
            id = force_str(urlsafe_base64_decode(uid))
            user = Users.objects.get(pk=id)
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, Users.DoesNotExist):
            return Response({"error": "Invalid activation link"}, status=status.HTTP_400_BAD_REQUEST)

class LoginPage(APIView):
    serializer_class = LoginSerializer
    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh=RefreshToken.for_user(user)
            return Response({
                "id":user.id,
                "name":user.name,
                "email":user.email,
                "active":user.is_active,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },status=status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class Profiles(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        return Response({
            "id":user.id,
            "is_active":user.is_active
        })
        
class AdminLogin(APIView):
    serializer_class = AdminSerializer
    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            admin = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(admin)
            return Response({
                "id":admin.id,
                "name":admin.name,
                "email":admin.email,
                "access":str(refresh.access_token),
                "refresh":str(refresh),
                "role":"admin"
            },status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class UserList(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        users = Users.objects.filter(role="user").order_by("-id")
        serializer = UserListSerializer(users,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class blockUser(APIView):
    permission_classes=[IsAdminUser]
    @extend_schema(
        tags=["Admin"],
        summary="Block/Unblock user",
        description="Update user active status using email",
    )
    def patch(self,request,email):
        user_status = request.data.get('is_active')
        if  user_status is None:
            return Response({
                "message":"status required"
            })
        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            return Response({
                "message":"User does not exist"
            },status=status.HTTP_400_BAD_REQUEST)
        user.is_active = user_status
        user.save()
            
        return Response({
            "message":f"{user.name} status is Updated"
        },status=status.HTTP_200_OK)
        
        
class Deleteuser(APIView):
    def delete(self, request, id):
        try:
            user = Users.objects.get(id=id)
            user.delete()
            return Response({"message": "user deleted"}, status=200)
        except Users.DoesNotExist:
            return Response({"message": "user not exist"}, status=404)
    