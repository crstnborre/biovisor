from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Layer, Feature
from .serializers import LayerSerializer, FeatureSerializer
from .upload import handle_geojson, handle_geotiff


class UserView(APIView):
    permission_classes = []

    def get(self, request):
        get_token(request)
        if request.user.is_authenticated:
            return Response({'username': request.user.username})
        return Response({'username': None})


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({'username': user.username})
        return Response({'error': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'ok': True})


class LayerListView(generics.ListAPIView):
    serializer_class = LayerSerializer
    queryset = Layer.objects.filter(visible=True).order_by('order', 'created_at')


class LayerFeatureListView(generics.ListAPIView):
    serializer_class = FeatureSerializer

    def get_queryset(self):
        return Feature.objects.filter(
            layer_id=self.kwargs['pk'],
            layer__visible=True,
        )


class AdminLayerListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LayerSerializer
    queryset = Layer.objects.all().order_by('order', 'created_at')


class LayerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        layer = get_object_or_404(Layer, pk=pk)
        layer.visible = not layer.visible
        layer.save(update_fields=['visible'])
        return Response(LayerSerializer(layer).data)

    def delete(self, request, pk):
        layer = get_object_or_404(Layer, pk=pk)
        if layer.type == Layer.TYPE_GEOTIFF and layer.file_key:
            try:
                from .storage import delete_file
                delete_file(layer.file_key)
            except Exception:
                pass
        layer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
