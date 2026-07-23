# Despliegue en Hostinger

Esta app usa Node.js + Express + Prisma y necesita una base de datos MySQL en Hostinger.

## Pasos rápidos

1. Crea la base de datos y el usuario en Hostinger.
2. Autoriza tu IP para conexión remota si quieres usarla desde tu PC.
3. Configura variables de entorno en Hostinger y/o en tu `.env` local.

Variables necesarias:

- `DATABASE_URL` (MySQL local del mismo hosting, usando `127.0.0.1`)
- `PORT`
- `NODE_ENV`
- `APP_NAME`
- `APP_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Ejemplo obligatorio si la app Node y MySQL estan en el mismo hosting de Hostinger:
```env
DATABASE_URL="mysql://u122249446_HernanH:TU_PASSWORD@127.0.0.1:3306/u122249446_bdCarros17"
PORT=3000
NODE_ENV=production
APP_NAME="Grupo w logist"
APP_URL=https://grupowlogist.com/
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=8h
DATABASE_CONNECTION_LIMIT=3
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

Reemplaza solo `TU_PASSWORD` por la clave real del usuario MySQL.
En produccion, dentro de Hostinger, no uses `srv1665.hstgr.io` ni otro host remoto en `DATABASE_URL`.
Usa `127.0.0.1`, porque la app Node y MySQL corren dentro del mismo hosting.

Usa el host tipo `srv1665.hstgr.io` solo para conectarte desde fuera de Hostinger, por ejemplo desde tu PC o una herramienta remota con Remote MySQL habilitado.

## Ajustes para bajar consumo en Hostinger

La app ya limita el pool de MySQL si `DATABASE_URL` no trae `connection_limit`. En hosting compartido esto ayuda a evitar picos de conexiones y CPU.

Variables utiles:

- `DATABASE_CONNECTION_LIMIT=2` o `3`: mantiene pocas conexiones abiertas a MySQL. Usa `2` si Hostinger sigue marcando consumo alto.
- `DATABASE_POOL_TIMEOUT=10`: corta esperas largas cuando MySQL esta saturado.
- `PUBLIC_CATALOG_CACHE_SECONDS=259200`: permite que navegador/CDN reutilicen el catalogo publico por 3 dias.
- `PUBLIC_CATALOG_STALE_SECONDS=259200`: permite responder con catalogo reciente hasta 3 dias adicionales mientras se revalida.
- `COMPLIANCE_RUN_ON_STARTUP=false`: evita que cada reinicio escanee vencimientos inmediatamente.
- `COMPLIANCE_NOTIFICATIONS_ENABLED=true`: mantiene activos los correos automaticos de vencimientos.
- `HTTP_LOGS=false`: deja apagado el log por cada request en produccion.
- `IMAGE_PROCESSING_CONCURRENCY=1`: mantiene Sharp procesando una imagen a la vez.
- `IMAGE_CACHE_MEMORY_MB=16`: baja la memoria interna usada por Sharp.
- `UPLOAD_IMAGE_MAX_MB=5`: rechaza fotos demasiado pesadas antes de procesarlas.
- `VEHICLE_DETAIL_HISTORY_LIMIT=25`: limita historial cargado por detalle de vehiculo.
- `VEHICLE_DETAIL_PHOTO_LIMIT=12`: limita fotos cargadas por detalle de vehiculo.

## Subir el proyecto

Incluye en el deploy:

- `src/`
- `public/`
- `prisma/`
- `package.json`
- `package-lock.json`

No subas:

- `node_modules/`
- `.env`

## Arrancar

```bash
npm start
```

La app debe usar la base definida en `DATABASE_URL`.

En Hostinger debe ser:

```env
DATABASE_URL="mysql://u122249446_HernanH:TU_PASSWORD@127.0.0.1:3306/u122249446_bdCarros17"
```

Hostinger debe detectar:

- Runtime: `Node.js`
- Start command: `npm start`

Tu entrada actual es:

```json
"start": "node src/server.js"
```

## 6. Instala dependencias y Prisma

Despues del despliegue, la app necesita:

```bash
npm install
npx prisma generate
```

Luego crea las tablas. Tienes dos opciones:

### Opcion A: recomendada si quieres respetar migraciones

```bash
npm run prisma:deploy
```

### Opcion B: util si solo quieres empujar el esquema actual

```bash
npx prisma db push
```

Como tu proyecto ya tiene carpeta `prisma/migrations`, conviene usar primero `migrate deploy`.

## 7. Crear el usuario administrador

Cuando la base ya exista, ejecuta:

```bash
npm run seed:admin
```

Esto usa:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## 8. Verifica que la app responda

Prueba:

```text
/health
```

Debe devolver algo como:

```json
{ "status": "ok" }
```

Para probar tambien MySQL, usa:

```text
/health?database=1
```

Debe devolver:

```json
{ "status": "ok", "database": "ok" }
```

Si responde `database: "error"`, la app esta viva pero MySQL no esta disponible para Prisma. Revisa `DATABASE_URL`, reinicia la app y vuelve a ejecutar migraciones/seed.

## 9. Cuidado con las fotos subidas

Las imagenes se guardan en:

```text
uploads/vehicles
```

Eso significa:

- el servidor necesita permiso de escritura en `uploads/`
- si redeployas y Hostinger reemplaza archivos, podrias perder imagenes subidas

Para una version inicial puede servir asi. Para algo mas robusto, despues conviene mover fotos a almacenamiento externo.

## 10. Checklist rapido

1. Crear base MySQL en Hostinger
2. Poner `DATABASE_URL` con `127.0.0.1`: `mysql://u122249446_HernanH:TU_PASSWORD@127.0.0.1:3306/u122249446_bdCarros17`
3. Configurar `JWT_SECRET` nuevo
4. Subir proyecto sin `.env` ni `node_modules`
5. Ejecutar `npm install`
6. Ejecutar `npx prisma generate`
7. Ejecutar `npm run prisma:deploy`
8. Ejecutar `npm run seed:admin`
9. Iniciar con `npm start`
10. Probar `/health`

## Recomendacion importante

Tu `.env` local tenia credenciales reales de desarrollo. Antes de pasar a produccion:

- cambia la clave del admin
- cambia el `JWT_SECRET`
- usa credenciales nuevas para la base de datos de produccion
- en Hostinger produccion, la base debe apuntar a `127.0.0.1`, no al host remoto
