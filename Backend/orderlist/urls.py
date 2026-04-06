from django.urls import path
from .import views
from drf_spectacular.views import SpectacularAPIView,SpectacularSwaggerView
urlpatterns=[
    path('orderlist/',views.OrderList.as_view(),name='order-list'),
    path('update/status/<int:id>/',views.StatusUpdate.as_view(),name='status-update'),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]