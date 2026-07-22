# Despliegue en Hostinger

Esta app usa Node.js + Express + Prisma y necesita una base de datos MySQL remota.

## Pasos rápidos

1. Crea la base de datos y el usuario en Hostinger.
2. Autoriza tu IP para conexión remota si quieres usarla desde tu PC.
3. Configura variables de entorno en Hostinger y/o en tu `.env` local.

Variables necesarias:

- `DATABASE_URL` (MySQL remoto)
- `PORT`
- `NODE_ENV`
- `APP_NAME`
- `APP_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Ejemplo si la app Node y MySQL estan en el mismo hosting de Hostinger:
```env
DATABASE_URL="mysql://usuario:clave@localhost:3306/u122249446_bdCarros17"
PORT=3000
NODE_ENV=production
APP_NAME="Grupo w logist"
APP_URL=https://grupowlogist.com/
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=8h
DATABASE_CONNECTION_LIMIT=3
DATABASE_POOL_TIMEOUT=10
COMPLIANCE_RUN_ON_STARTUP=false
HTTP_LOGS=false
```

Usa el host tipo `srv1665.hstgr.io` solo para conectarte desde fuera de Hostinger, por ejemplo desde tu PC o una herramienta remota con Remote MySQL habilitado.

## Ajustes para bajar consumo en Hostinger

La app ya limita el pool de MySQL a 3 conexiones si `DATABASE_URL` no trae `connection_limit`. En hosting compartido esto ayuda a evitar picos de conexiones y CPU.

Variables utiles:

- `DATABASE_CONNECTION_LIMIT=3`: mantiene pocas conexiones abiertas a MySQL.
- `DATABASE_POOL_TIMEOUT=10`: corta esperas largas cuando MySQL esta saturado.
- `COMPLIANCE_RUN_ON_STARTUP=false`: evita que cada reinicio escanee vencimientos inmediatamente.
- `COMPLIANCE_NOTIFICATIONS_ENABLED=false`: desactiva totalmente el chequeo diario de vencimientos si Hostinger sigue reclamando consumo.
- `HTTP_LOGS=false`: deja apagado el log por cada request en produccion.
- `IMAGE_PROCESSING_CONCURRENCY=1`: mantiene Sharp procesando una imagen a la vez.

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

La app debe usar la base remota definida en `DATABASE_URL`.
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
2. Poner `DATABASE_URL` real de Hostinger
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
