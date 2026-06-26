# biovisor

Portal público de visualización de capas geoespaciales y zonas de riesgo ambiental. Permite subir y publicar capas GeoJSON y GeoTIFF sobre un mapa interactivo.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + MapLibre GL JS + Tailwind CSS v4 |
| Backend | Django 5 + Django REST Framework + GeoDjango |
| Base de datos | PostgreSQL 16 + PostGIS 3.4 |
| Tiles raster | TiTiler (on-the-fly desde MinIO) |
| Storage | MinIO (local) / AWS S3 (producción) |
| Infraestructura | Docker Compose |

## Arquitectura

```
browser
  ├── :5173  →  Vite (React SPA)
  │              ├── /          →  mapa público
  │              └── /admin     →  panel de administración
  │
  └── :8000  →  Django API
  └── :8090  →  TiTiler (tiles GeoTIFF)
  └── :9001  →  MinIO console
```

Las capas vectoriales (GeoJSON) se almacenan en PostGIS y se sirven como FeatureCollection. Las capas raster (GeoTIFF) se suben a MinIO y TiTiler las convierte a tiles XYZ en tiempo real, sin pre-procesamiento.

## Configuración local

### Requisitos

- Docker + Docker Compose

### Pasos

```bash
git clone <repo>
cd biovisor

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build

# En otra terminal, una sola vez:
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

El superusuario creado con `createsuperuser` es el que se usa para entrar al panel admin en `/admin`.

### Servicios

| Servicio | URL | Credenciales |
|---|---|---|
| Mapa público | http://localhost:5173 | — |
| Panel admin | http://localhost:5173/admin | usuario creado con createsuperuser |
| API | http://localhost:8000 | — |
| TiTiler | http://localhost:8090 | — |
| MinIO console | http://localhost:9001 | minioadmin / minioadmin |
| PostgreSQL | localhost:5433 | ver backend/.env |

## Uso

### Mapa público (`/`)

- Lista de capas en el panel lateral izquierdo
- Click en una capa para activar/desactivar su visibilidad
- Hover sobre la capa activa → ícono de crosshair → zoom a los bounds de esa capa
- Click sobre cualquier feature en el mapa → popup con sus propiedades

### Panel admin (`/admin`)

Requiere autenticación. Desde aquí se administran todas las capas:

- **Subir capa**: formulario con nombre, descripción y archivo (GeoJSON o GeoTIFF)
- **Toggle visible**: click en cualquier fila para alternar visibilidad en el mapa público
- **Editar**: ícono de lápiz (hover) → editar nombre y descripción
- **Eliminar**: ícono de papelera (hover) → confirmación antes de borrar
- **Buscar**: filtro en tiempo real por nombre de capa

### Formatos soportados

| Formato | Extensiones | Límite | Flujo |
|---|---|---|---|
| GeoJSON | `.geojson`, `.json` | 50 MB | Upload → PostGIS → MapLibre (vectorial) |
| GeoTIFF | `.tif`, `.tiff` | 500 MB | Upload → MinIO → TiTiler → MapLibre (raster) |

Los GeoTIFF pueden estar en cualquier CRS. TiTiler los reprojecta a Web Mercator automáticamente.

## API

### Pública

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/layers/` | Lista de capas visibles |
| `GET` | `/api/layers/{id}/features/` | Features GeoJSON de una capa vectorial |

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/auth/user/` | Usuario de sesión actual |
| `POST` | `/api/auth/login/` | Iniciar sesión `{username, password}` |
| `POST` | `/api/auth/logout/` | Cerrar sesión |

### Admin (requiere sesión activa)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/admin/layers/` | Todas las capas (incluye no visibles) |
| `POST` | `/api/admin/layers/upload/` | Subir capa (multipart/form-data) |
| `PATCH` | `/api/admin/layers/{id}/` | Toggle visible (sin body) o editar `{name, description}` |
| `DELETE` | `/api/admin/layers/{id}/` | Eliminar capa y sus datos |

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SECRET_KEY` | Django secret key | `cambiar-en-produccion` |
| `DEBUG` | Modo debug | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS | `http://localhost:5173` |
| `CSRF_TRUSTED_ORIGINS` | Orígenes CSRF | `http://localhost:5173` |
| `TITILER_URL` | URL de TiTiler accesible desde el browser | `http://localhost:8090` |
| `DB_NAME` | Nombre de la base de datos | `biovisor` |
| `DB_USER` | Usuario PostgreSQL | `biovisor` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `biovisor` |
| `DB_HOST` | Host PostgreSQL | `db` |
| `AWS_STORAGE_BUCKET_NAME` | Bucket MinIO/S3 | `biovisor` |
| `AWS_S3_ENDPOINT_URL` | Endpoint MinIO/S3 | `http://minio:9000` |
| `AWS_ACCESS_KEY_ID` | Access key MinIO/S3 | `minioadmin` |
| `AWS_SECRET_ACCESS_KEY` | Secret key MinIO/S3 | `minioadmin` |

### `frontend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL del backend accesible desde el browser | `http://localhost:8000` |

## Datos de prueba

En `test_data/colombia_test.geojson` hay un FeatureCollection con polígonos, líneas y puntos sobre Colombia para probar la subida y visualización de capas GeoJSON.

## Producción

Para desplegar en producción:

- Cambiar `DEBUG=False` y generar un `SECRET_KEY` seguro
- Actualizar `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` con el dominio real
- Reemplazar MinIO por AWS S3: actualizar `AWS_S3_ENDPOINT_URL` y credenciales
- Agregar nginx como proxy reverso frente a Django y Vite build estático
- Cambiar `TITILER_URL` a la URL pública de TiTiler

## Licencia

MIT
