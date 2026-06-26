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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        nested = ret.get('properties', {}).get('properties')
        if nested is not None:
            ret['properties'] = nested
        return ret
