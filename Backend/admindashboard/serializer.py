from rest_framework import serializers

class CountSerializer(serializers.Serializer):
    count = serializers.IntegerField()

class RevenueSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)