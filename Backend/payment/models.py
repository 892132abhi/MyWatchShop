from django.db import models
from accounts.models import Users
from products.models import Products
from django.core.validators import RegexValidator


phone_validator = RegexValidator(
    regex=r'^\+?\d{10}$',
    message="Enter a valid phone number"
)

pincode_validator = RegexValidator(
    regex=r'^\d{6}$',
    message="Enter a valid pincode number"
)


class Order(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateField(auto_now_add=True)

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=250)
    pincode = models.CharField(max_length=10, validators=[pincode_validator])
    phone = models.CharField(max_length=15, validators=[phone_validator])

    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    def __str__(self):
        return f"Order {self.id} - {self.user}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.order.id} - {self.product} - {self.quantity}"


class Payments(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    )

    PAYMENT_METHOD = (
        ('cod', 'Cash On Delivery'),
        ('onlinepayment', 'OnlinePayment'),
        ('wallet','Wallet')
    )

    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE,related_name='payments')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)

    def __str__(self):
        return f"{self.user} - Order {self.order.id}"
    

    
