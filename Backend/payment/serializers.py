from rest_framework import serializers
from .models import Order,OrderItem,Payments

        
class PaymentSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Payments
        fields=['user','order','total_amount','created_at','paymet_status','payment_method']


class PlaceOrderSerializer(serializers.Serializer):
    selected_product_ids = serializers.ListField(
    child=serializers.IntegerField(),
    allow_empty=False
)
    name = serializers.CharField(max_length=200)
    address = serializers.CharField(max_length=250)
    pincode = serializers.CharField(max_length=10)
    phone = serializers.CharField(max_length=15)
    payment_method = serializers.ChoiceField(choices=["cod", "onlinepayment","wallet"])
    
    
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_brand = serializers.CharField(source="product.brand", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    order_date = serializers.DateField(source="order.created_at", read_only=True)
    total_price = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "product_name",
            "product_brand",
            "product_image",
            "price",
            "quantity",
            "order_date",
            "total_price",
            "payment_method",
            "payment_status",
        ]

    def get_total_price(self, obj):
        return obj.price * obj.quantity

    def get_payment_method(self, obj):
        payment = obj.order.payments.first()
        return payment.payment_method if payment else None

    def get_payment_status(self, obj):
        payment = obj.order.payments.first()
        return payment.payment_status if payment else None
    
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields=['user','total_amount','created_at','name','address','pincode','phone','items','payments']
        
        def validate_phone(self,value):
            if len(value) !=10:
                raise serializers.ValidationError("Phone number is not correct")
            return value
