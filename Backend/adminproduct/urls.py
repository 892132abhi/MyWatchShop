from django.urls import path
from .import views
from drf_spectacular.views import SpectacularAPIView,SpectacularSwaggerView
urlpatterns=[
    path('singleproduct/<int:id>/',views.SingleProduct.as_view(),name='single-product'),
    path('delete/<int:id>/',views.DeleteProduct.as_view(),name='product-delete'),
    path('addproduct/',views.AddProducts.as_view(),name='add-product'),
    path('editproduct/<int:id>/',views.EditProducts.as_view(),name='edit-product'),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]