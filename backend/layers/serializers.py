from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.conf import settings
from .models import Layer, Feature


class LayerSerializer(serializers.ModelSerializer):
    tiles_url = serializers.SerializerMethodField()
    tilejson_url = serializers.SerializerMethodField()

    def get_tiles_url(self, obj):
        if obj.type != Layer.TYPE_GEOTIFF or not obj.file_key:
            return None
        s3_url = f"s3://{settings.AWS_STORAGE_BUCKET_NAME}/{obj.file_key}"
        return f"{settings.TITILER_URL}/cog/tiles/WebMercatorQuad/{{z}}/{{x}}/{{y}}?url={s3_url}"

    def get_tilejson_url(self, obj):
        if obj.type != Layer.TYPE_GEOTIFF or not obj.file_key:
            return None
        s3_url = f"s3://{settings.AWS_STORAGE_BUCKET_NAME}/{obj.file_key}"
        return f"{settings.TITILER_URL}/cog/WebMercatorQuad/tilejson.json?url={s3_url}"

    class Meta:
        model = Layer
        fields = ['id', 'name', 'description', 'type', 'visible', 'order', 'tile_status', 'created_at', 'tiles_url', 'tilejson_url']


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
