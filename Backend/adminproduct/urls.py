from django.urls import path
from .import views

urlpatterns=[
    path('singleproduct/<int:id>/',views.SingleProduct.as_view(),name='single-product'),
    path('delete/<int:id>/',views.DeleteProduct.as_view(),name='product-delete'),
    path('addproduct/',views.AddProducts.as_view(),name='add-product'),
    path('editproduct/<int:id>/',views.EditProducts.as_view(),name='edit-product')
]