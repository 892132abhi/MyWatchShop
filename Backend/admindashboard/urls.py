from django.urls import path
from .import views

urlpatterns=[
    path('totalusers/',views.TotalUsers.as_view(),name='total-users'),
    path('activeusers/',views.ActiveUsers.as_view(),name='active-user'),
    path('blockedusers/',views.BlockedUsers.as_view(),name='blocked-user'),
    path('totalorders/',views.TotalOrders.as_view(),name='total-orders'),
    path('totalrevenue/',views.TotalRevenue.as_view(),name='total-revenue'),
]