# biovisor

Portal público de visualización de capas geoespaciales ambientales y zonas de riesgo natural en Colombia.

## Stack

- **Frontend:** React + Vite + MapLibre GL JS + Tailwind CSS v4 + Lucide React + SweetAlert2
- **Backend:** Django REST Framework
- **Base de datos:** PostgreSQL + PostGIS
- **Storage:** MinIO (local) / AWS S3 (producción)
- **Infraestructura:** Docker

## Arquitectura

Monorepo cliente-servidor. El frontend consume la API de Django. Las capas vectoriales se almacenan en PostGIS y se sirven como GeoJSON. Las capas raster (GeoTIFF) se procesan al subir y se almacenan como tiles XYZ estáticos en object storage.

## Formatos soportados

| Formato | Flujo |
|---|---|
| GeoJSON | Subida → PostGIS → MapLibre |
| GeoTIFF | Subida → tiles XYZ (async) → MapLibre raster layer |

## Configuración local

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| MinIO console | http://localhost:9001 |
| PostgreSQL | localhost:5433 |

## API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/layers/` | Lista de capas visibles |
| GET | `/api/layers/{id}/features/` | Features GeoJSON de una capa |
| POST | `/api/admin/layers/upload/` | Subir capa (requiere autenticación) |

El admin de Django está en `/admin/`.

### Subir una capa

```bash
curl -X POST http://localhost:8000/api/admin/layers/upload/ \
  -u usuario:password \
  -F "name=Nombre de la capa" \
  -F "description=Descripción opcional" \
  -F "file=@archivo.geojson"
```

Formatos soportados: `.geojson`, `.json`, `.tif`, `.tiff`.

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`.

Para producción, apuntar `AWS_S3_ENDPOINT_URL` a S3 y configurar las credenciales de AWS correspondientes.

## Licencia

MIT
