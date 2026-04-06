from django.urls import path
from .import views
urlpatterns=[
    path('orderlist/',views.OrderList.as_view(),name='order-list'),
    path('update/status/<int:id>/',views.StatusUpdate.as_view(),name='status-update')
]