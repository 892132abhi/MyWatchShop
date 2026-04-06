from django.db import models
from accounts.models import Users
# Create your models here.

class Wallet(models.Model):
    user =models.OneToOneField(Users,on_delete=models.CASCADE,related_name="wallet")
    balance = models.DecimalField(max_digits=10,decimal_places=2,default=0.00)
    
    def __str__(self):
        return f"{self.user} - {self.balance}"
    
class WalletTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('credit', "Credit"),
        ('debit', "Debit"),
    )

    wallet = models.ForeignKey(Wallet,on_delete=models.CASCADE,related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet.user.email} - {self.transaction_type} - {self.amount}"
    
