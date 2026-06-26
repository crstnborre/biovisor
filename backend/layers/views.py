from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Layer, Feature
from .serializers import LayerSerializer, FeatureSerializer
from .upload import handle_geojson, handle_geotiff

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

class LayerUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        file = request.FILES.get('file')

        if not name:
            return Response({'error': 'El nombre es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        if not file:
            return Response({'error': 'El archivo es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()

        try:
            if filename.endswith(('.geojson', '.json')):
                layer = handle_geojson(file, name, description)
            elif filename.endswith(('.tif', '.tiff')):
                layer = handle_geotiff(file, name, description)
            else:
                return Response(
                    {'error': 'Formato no soportado. Use .geojson, .json, .tif o .tiff'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(LayerSerializer(layer).data, status=status.HTTP_201_CREATED)
