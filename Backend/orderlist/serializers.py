from rest_framework import serializers
from payment.models import Payments
class OrderListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    order_id = serializers.IntegerField(source="order.id", read_only=True)

    class Meta:
        model = Payments
        fields = [
            "id",
            "order_id",
            "user_name",
            "user_email",
            "total_amount",
            "created_at",
            "payment_status",
            "payment_method",
        ]