from django.urls import path
from .views import LayerListView, LayerFeatureListView, LayerUploadView

urlpatterns = [
    path('layers/', LayerListView.as_view()),
    path('layers/<int:pk>/features/', LayerFeatureListView.as_view()),
    path('admin/layers/upload/', LayerUploadView.as_view()),
]
