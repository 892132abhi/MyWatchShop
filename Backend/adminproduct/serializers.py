from rest_framework import serializers
from products.models import Products

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Products
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data["image"] = instance.image.url if instance.image else None
        except Exception:
            data["image"] = None
        return data
