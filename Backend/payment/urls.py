from django.urls import path
from .import views
urlpatterns=[
    path('order/place-order/',views.PlaceOrder.as_view(),name='place-order'),
    path('order/items/',views.OrderedItems.as_view(),name='items'),
    path('razorpay/verify-payment/',views.VerifyPayment.as_view(),name='verify-payment')
]