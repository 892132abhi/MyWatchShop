from django.db import models
from accounts.models import Users
# Create your models here.
class Products(models.Model):
    name =models.CharField(max_length=200)
    price = models.IntegerField()
    brand = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="products/")
    def __str__(self):
        return self.name
    
class Cart(models.Model):
    user = models.ForeignKey(Users,on_delete=models.CASCADE)
    product = models.ForeignKey(Products,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together=['user','product']
    def __str__(self):
        return f"{self.user} - {self.product.name}"
class Wishlist(models.Model):
    user = models.ForeignKey(Users,on_delete=models.CASCADE)
    product = models.ForeignKey(Products,on_delete=models.CASCADE)
    class Meta:
        unique_together = ['user','product']
    def __str__(self):
        return f"{self.user} - {self.product}"
        
