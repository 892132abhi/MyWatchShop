from django.urls import path
from .import views
urlpatterns=[
   path('',views.productsPage.as_view(),name='productspage'),
   path('cart/add/',views.AddCart.as_view(),name='add-to-cart'),
   path('cart/',views.Cartitems.as_view(),name='cart-items'),
   path('cart/update/',views.AddQuantity.as_view(),name='add-quantity'),
   path('cart/remove/',views.RemoveItem.as_view(),name='remove-item'),
   path('wishlist/add/',views.AddtoWishlist.as_view(),name='wishlist-item'),
   path('wishlist/',views.WishlistItem.as_view(),name='wish-list'),
   path('wishlist/remove/',views.RemoveWishItem.as_view(),name='remove-wishlist'),
   path('cart/count/',views.CartCount.as_view(),name='cart-count'),
   path('wishlist/count/',views.WishCount.as_view(),name='wish-count'),
   path('productview/<int:id>/',views.ProductView.as_view(),name='product-view')
]