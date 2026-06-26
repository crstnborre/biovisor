import json
from django.contrib.gis.geos import GEOSGeometry
from .models import Layer, Feature
from .storage import upload_file

MAX_GEOJSON_MB = 50
MAX_GEOTIFF_MB = 500


def handle_geojson(file, name, description):
    if file.size > MAX_GEOJSON_MB * 1024 * 1024:
        raise ValueError(f'El archivo supera el límite de {MAX_GEOJSON_MB}MB')

    try:
        data = json.load(file)
    except json.JSONDecodeError:
        raise ValueError('El archivo no es JSON válido')

    if data.get('type') != 'FeatureCollection':
        raise ValueError('El archivo debe ser un GeoJSON de tipo FeatureCollection')

    raw_features = data.get('features') or []
    if not raw_features:
        raise ValueError('El GeoJSON no contiene features')

    features = []
    for i, f in enumerate(raw_features):
        try:
            geometry = GEOSGeometry(json.dumps(f['geometry']))
        except Exception:
            raise ValueError(f'Geometría inválida en el feature #{i + 1}')
        features.append(Feature(
            geometry=geometry,
            properties=f.get('properties') or {},
        ))

    layer = Layer.objects.create(
        name=name,
        description=description,
        type=Layer.TYPE_GEOJSON,
        tile_status=Layer.STATUS_READY,
    )

    for f in features:
        f.layer = layer
    Feature.objects.bulk_create(features)

    return layer


def handle_geotiff(file, name, description):
    if file.size > MAX_GEOTIFF_MB * 1024 * 1024:
        raise ValueError(f'El archivo supera el límite de {MAX_GEOTIFF_MB}MB')

    layer = Layer.objects.create(
        name=name,
        description=description,
        type=Layer.TYPE_GEOTIFF,
        tile_status=Layer.STATUS_PENDING,
    )

    try:
        key = f'geotiff/{layer.id}/{file.name}'
        upload_file(file, key)
    except Exception as e:
        layer.delete()
        raise ValueError(f'Error al subir el archivo: {e}')

    layer.file_key = key
    layer.save(update_fields=['file_key'])

    return layer
