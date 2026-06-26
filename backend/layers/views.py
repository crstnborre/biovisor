from rest_framework import generics
from .models import Layer, Feature
from .serializers import LayerSerializer, FeatureSerializer


class LayerListView(generics.ListAPIView):
    serializer_class = LayerSerializer
    queryset = Layer.objects.filter(visible=True)


class LayerFeatureListView(generics.ListAPIView):
    serializer_class = FeatureSerializer

    def get_queryset(self):
        return Feature.objects.filter(
            layer_id=self.kwargs['pk'],
            layer__visible=True,
        )
