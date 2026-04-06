from django.urls import path
from .import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns=[
    path('register/',views.RegisterPage.as_view(),name='register'),
    path('login/',views.LoginPage.as_view(),name='login'),
    path('activate/<uidb64>/<token>/',views.activate_account,name='activate-account'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('profile/',views.Profiles.as_view(),name="profile"),
    path('adminlogin/',views.AdminLogin.as_view(),name='adminlogin'),
    path('userlist/',views.UserList.as_view(),name='user-list'),
    path('users/block/<str:email>/',views.blockUser.as_view(),name='block-user')
]