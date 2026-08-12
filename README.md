# GRUPO W LOGIST

Aplicacion web para gestionar el inventario de vehiculos de la flota, usuarios internos, fotos, catalogo publico, estados operativos, finanzas y alertas de vencimientos.

El proyecto usa Node.js, Express, Prisma y MySQL. Prisma esta configurado con `engineType = "client"` y `@prisma/adapter-mariadb` para conectarse a MySQL sin depender del motor Rust en produccion.

## Funcionalidades actuales

- Catalogo publico de vehiculos visibles con imagen, estado, marca, modelo y operador.
- Panel privado por roles para administrar vehiculos, usuarios, finanzas y perfil.
- Registro de vehiculos con placa, marca, modelo, anio, operador asignado, kilometraje, propietario, vencimientos, tramites, multas, VIN, observaciones, estado inicial e imagen.
- Detalle de vehiculo con informacion en este orden: Marca, Modelo, Anio, Operador asignado, Kilometraje actual, Propietario, Vencimiento de SOAT, Vencimiento de tecnomecanica, Vencimiento del impuesto vehicular, Tramites pendientes o multas, VIN, Creado por y Observaciones.
- Edicion de datos administrativos del vehiculo y actualizacion de estado.
- Carga, visualizacion y eliminacion de fotos por vehiculo.
- Historial de cambios administrativos y de estados.
- Modulo financiero para ingresos por flete, alquiler, venta de vehiculo, gastos generales, compra de vehiculo y mantenimientos.
- Perfil de usuario con correo de contacto y verificacion.
- Alertas por correo para vencimientos de SOAT, tecnomecanica e impuesto vehicular.
- Interfaz responsive para escritorio y dispositivos moviles.

Cuando un dato del detalle de vehiculo no esta registrado, la interfaz muestra `No registrado`.

## Requisitos

- Node.js `>=20.9.0`
- npm
- Base de datos MySQL o MariaDB

## Ejecutar en local

Instala dependencias y genera el cliente Prisma:

```bash
npm install
npx prisma generate
```

Ejecuta en modo desarrollo:

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

Para ejecutar sin recarga automatica:

```bash
npm start
```

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto. Ejemplo para produccion en Hostinger:

```env
DATABASE_URL="mysql://u122249446_HernanH:TU_PASSWORD@127.0.0.1:3306/u122249446_bdCarros17"
JWT_SECRET="una_clave_segura"
PORT=3000
NODE_ENV=production
APP_NAME="Grupo w logist"
APP_URL="https://grupowlogist.com/"
JWT_EXPIRES_IN=8h
ADMIN_NAME="Administrator"
ADMIN_PASSWORD="TU_PASSWORD_ADMIN"

SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="atencion@grupowlogist.com"
SMTP_PASSWORD="TU_PASSWORD_SMTP"
SMTP_FROM="atencion@grupowlogist.com"

DATABASE_CONNECTION_LIMIT=2
DATABASE_POOL_TIMEOUT=10
PUBLIC_CATALOG_CACHE_SECONDS=259200
PUBLIC_CATALOG_STALE_SECONDS=259200
COMPLIANCE_NOTIFICATIONS_ENABLED=true
COMPLIANCE_RUN_ON_STARTUP=false
HTTP_LOGS=false
IMAGE_PROCESSING_CONCURRENCY=1
IMAGE_CACHE_MEMORY_MB=16
UPLOAD_IMAGE_MAX_MB=5
```

Para conectarte desde fuera de Hostinger, usa el host remoto que corresponda en `DATABASE_URL`. En produccion dentro de Hostinger debe usarse `127.0.0.1`.

## Base de datos

El esquema vive en `prisma/schema.prisma` y las migraciones en `prisma/migrations/`.

Comandos utiles:

```bash
npx prisma generate
npm run prisma:deploy
npm run seed:admin
```

En una base nueva, ejecuta `npm run prisma:deploy` antes de crear el admin. En una base de produccion existente, evita `prisma db push` y `prisma migrate dev`.

## Estructura principal

- `src/app.js`: configuracion de Express, rutas API y fallback de la app web.
- `src/server.js`: arranque del servidor.
- `src/modules/vehicles/`: API de vehiculos, validaciones y rutas.
- `src/modules/status/`: cambios de estado de vehiculos.
- `src/modules/photos/`: carga y eliminacion de fotos.
- `src/modules/finance/`: movimientos financieros.
- `src/modules/users/`: usuarios y perfil.
- `src/modules/catalog/`: catalogo publico.
- `public/`: interfaz web servida por Express.
- `uploads/vehicles/`: fotos cargadas por los usuarios.
- `uploads/.cache/`: cache de imagenes procesadas.

## Subir a Hostinger

Sube solo:

- `src/`
- `public/`
- `prisma/`
- `package.json`
- `package-lock.json`
- `prisma.config.ts`
- `README.md`
- `DEPLOY_HOSTINGER.md`

No subas:

- `node_modules/`
- `.env`
- `uploads/vehicles/`
- `uploads/.cache/`

## Notas de produccion

- Hostinger usa Passenger/`lsnode` y `PassengerStartupFile src/server.js`.
- Las fotos subidas se guardan en `uploads/vehicles/`.
- El cache de imagenes se genera en `uploads/.cache/`.
- Los correos de vencimiento quedan activos con `COMPLIANCE_NOTIFICATIONS_ENABLED=true`.
- `COMPLIANCE_RUN_ON_STARTUP=false` evita disparar alertas apenas inicia el servidor.
