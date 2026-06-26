from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Layer, Feature


class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = ['id', 'name', 'description', 'type', 'visible', 'order', 'tile_status', 'created_at']


class FeatureSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Feature
        geo_field = 'geometry'
        fields = ['id', 'properties']
