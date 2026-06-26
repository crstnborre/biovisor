from django.urls import path
from .views import (
    LayerListView, LayerFeatureListView, LayerUploadView,
    UserView, LoginView, LogoutView, AdminLayerListView, LayerDetailView,
)

urlpatterns = [
    path('layers/', LayerListView.as_view()),
    path('layers/<int:pk>/features/', LayerFeatureListView.as_view()),
    path('auth/user/', UserView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('admin/layers/', AdminLayerListView.as_view()),
    path('admin/layers/upload/', LayerUploadView.as_view()),
    path('admin/layers/<int:pk>/', LayerDetailView.as_view()),
]
