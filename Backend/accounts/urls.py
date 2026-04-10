from django.urls import path
from .import views
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView,SpectacularSwaggerView

urlpatterns=[
    path('register/',views.RegisterPage.as_view(),name='register'),
    path('login/',views.LoginPage.as_view(),name='login'),
    path('activate/<uidb64>/<token>/',views.activate_account,name='activate-account'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('profile/',views.Profiles.as_view(),name="profile"),
    path('adminlogin/',views.AdminLogin.as_view(),name='adminlogin'),
    path('userlist/',views.UserList.as_view(),name='user-list'),
    path('users/block/<str:email>/',views.blockUser.as_view(),name='block-user'),
    path('users/delete/<str:email>/',views.Deleteuser.as_view(),name='delete-user'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]