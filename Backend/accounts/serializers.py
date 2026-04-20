from rest_framework import serializers
from .models import Users
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Users


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['name', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        if not value.endswith('@gmail.com'):
            raise serializers.ValidationError("Email is not correct.")
        return value

    def create(self, validated_data):
        return Users.objects.create_user(**validated_data)
    
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
        
    def validate(self,data):
        email = data.get('email')
        password = data.get('password')
            
        if email and password:
            user = authenticate(email=email,password=password)
            if not user:
                raise serializers.ValidationError("the user is not valid")
            if not user.is_active:
                raise serializers.ValidationError(" User is Not Active ")
            data['user']=user
            return data
class AdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self,value):
        email = value.get("email")
        password = value.get("password")
        user = authenticate(email=email,password=password)
        if not user:
            raise serializers.ValidationError("user is not valid")
        if not user.is_active:
            raise serializers.ValidationError("account is not active")
        if not user.is_staff:
            raise serializers.ValidationError("permission Restricted")
        if user.role !="admin":
            raise serializers.ValidationError("user does not have the access")
        value["user"]=user
        return value
    
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields ="__all__"
