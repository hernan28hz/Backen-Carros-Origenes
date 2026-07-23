# Backend Carros

Backend Node.js + Express + Prisma para inventario de vehiculos, usuarios, fotos, finanzas, catalogo publico y alertas por correo.

## Requisitos

- Node.js `>=20.9.0`
- MySQL en Hostinger
- npm

## Variables de entorno

En Hostinger produccion, `DATABASE_URL` debe usar `127.0.0.1`:

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

Reemplaza solo `TU_PASSWORD`, `TU_PASSWORD_ADMIN`, `TU_PASSWORD_SMTP` y `JWT_SECRET`. No uses `srv1665.hstgr.io` en produccion; ese host es solo para conectarte desde fuera de Hostinger.

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

## Instalacion

```bash
npm install
npx prisma generate
npm run prisma:deploy
npm run seed:admin
npm start
```

## Verificacion

```text
/health
/health?database=1
```

Si `/health?database=1` falla, revisa que `DATABASE_URL` sea exactamente con `127.0.0.1` y que la clave MySQL sea correcta.

## Notas clave

- Start command en Hostinger: `npm start`
- Las fotos subidas se guardan en `uploads/vehicles/`.
- El cache de imagenes se genera en `uploads/.cache/`.
- Los correos de vencimiento quedan activos con `COMPLIANCE_NOTIFICATIONS_ENABLED=true`.
