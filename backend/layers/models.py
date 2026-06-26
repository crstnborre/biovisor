from django.contrib.gis.db import models


class Layer(models.Model):
    TYPE_GEOJSON = 'geojson'
    TYPE_GEOTIFF = 'geotiff'
    TYPE_CHOICES = [
        (TYPE_GEOJSON, 'GeoJSON'),
        (TYPE_GEOTIFF, 'GeoTIFF'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_READY = 'ready'
    STATUS_ERROR = 'error'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_PROCESSING, 'Procesando'),
        (STATUS_READY, 'Listo'),
        (STATUS_ERROR, 'Error'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    # Solo GeoTIFF: clave del objeto en MinIO
    file_key = models.CharField(max_length=500, blank=True)
    tile_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.name


class Feature(models.Model):
    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name='features')
    geometry = models.GeometryField()
    properties = models.JSONField(default=dict)

    def __str__(self):
        return f'Feature {self.pk} — {self.layer.name}'
