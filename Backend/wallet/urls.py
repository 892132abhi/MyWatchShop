from django.urls import path
from .import views

urlpatterns=[
    path('balance/',views.WalletDetail.as_view(),name='wallet-balance')
]