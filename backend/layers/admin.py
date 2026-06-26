from django.contrib import admin
from .models import Layer, Feature


@admin.register(Layer)
class LayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'visible', 'tile_status', 'order', 'created_at']
    list_filter = ['type', 'visible', 'tile_status']
    list_editable = ['visible', 'order']


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ['id', 'layer']
    list_filter = ['layer']
