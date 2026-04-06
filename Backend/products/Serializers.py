from rest_framework import serializers
from .models import Products
class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model=Products
        fields='__all__'
        
    def get_image(self,obj):
        try:
            return obj.image.url
        except Exception:
            return None