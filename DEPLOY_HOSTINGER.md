# Despliegue en Hostinger

Esta app usa Node.js + Express + Prisma y MySQL en Hostinger.

## Variables necesarias en produccion

Estas son las variables que debes configurar en la app Node de Hostinger para que la plataforma funcione y pueda enviar correos:

```env
DATABASE_URL="mysql://u122249446_HernanH:TU_PASSWORD_MYSQL@127.0.0.1:3306/u122249446_bdCarros17"
NODE_ENV=production
APP_NAME="Grupo w logist"
APP_URL=https://grupowlogist.com/
JWT_SECRET=TU_CLAVE_SECRETA_SEGURA
SMTP_USER=info@grupowlogist.com
SMTP_FROM=info@grupowlogist.com
SMTP_PASSWORD=TU_PASSWORD_DEL_BUZON
```

Notas importantes:

- `DATABASE_URL` debe usar `127.0.0.1` en produccion, porque la app Node y MySQL estan en el mismo hosting.
- `TU_PASSWORD_MYSQL` es la clave del usuario de la base de datos MySQL.
- `JWT_SECRET` debe ser una clave larga y privada, distinta a la local.
- `SMTP_PASSWORD` es la clave del buzon `info@grupowlogist.com`, no la clave de MySQL, hPanel, FTP ni del usuario administrador de la app.
- Despues de cambiar variables en Hostinger, guarda y reinicia/redeploya la app Node.

El proyecto ya trae valores por defecto para estas variables, asi que no hace falta ponerlas si usas Hostinger:

```env
PORT=3000
JWT_EXPIRES_IN=8h
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
```

## Variables solo para crear el administrador

Configura estas variables solamente si vas a ejecutar `npm run seed:admin` para crear o actualizar el usuario administrador:

```env
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin01@grupowlogist.com
ADMIN_PASSWORD=TU_PASSWORD_ADMIN
```

Despues puedes quitarlas del panel si no las necesitas para futuros seeds.

## Correos SMTP

Si al enviar el codigo aparece `El envio de correos no esta configurado`, falta `SMTP_PASSWORD` o alguna variable SMTP en produccion.

Si el log muestra `Invalid login: 535 5.7.8 authentication failed`, Hostinger rechazo el usuario o la clave SMTP. Revisa:

- `SMTP_USER` debe ser exactamente el buzon creado, por ejemplo `info@grupowlogist.com`.
- `SMTP_FROM` debe ser el mismo correo o un alias autorizado del mismo dominio.
- `SMTP_PASSWORD` debe ser la clave actual del buzon.
- Si dudas de la clave, restablece la contrasena del buzon en Hostinger Email y copia la nueva clave en la app Node.

## Base de datos

En produccion usa:

```env
DATABASE_URL="mysql://u122249446_HernanH:TU_PASSWORD_MYSQL@127.0.0.1:3306/u122249446_bdCarros17"
```

No uses `srv1665.hstgr.io` dentro de Hostinger. Ese host remoto sirve solo para conectarte desde fuera de Hostinger, por ejemplo desde tu PC o una herramienta remota con Remote MySQL habilitado.

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

Hostinger debe detectar:

- Runtime: `Node.js`
- Start command: `npm start`

El comando actual del proyecto es:

```json
"start": "node src/server.js"
```

Despues del despliegue ejecuta:

```bash
npm install
npx prisma generate
```

Si hay migraciones pendientes o es una base nueva:

```bash
npm run prisma:deploy
```

Si la base de produccion ya esta funcionando y no hay migraciones pendientes, no necesitas tocar tablas.

## Verificar

Prueba:

```text
/health
```

Debe responder:

```json
{ "status": "ok" }
```

Para probar tambien MySQL:

```text
/health?database=1
```

Debe responder:

```json
{ "status": "ok", "database": "ok" }
```

Si responde `database: "error"`, revisa `DATABASE_URL`, reinicia la app y mira `stderr.log`.

## Checklist rapido

1. Crear base MySQL en Hostinger.
2. Configurar solo las variables necesarias de produccion.
3. Subir proyecto sin `.env` ni `node_modules`.
4. Ejecutar `npm install`.
5. Ejecutar `npx prisma generate`.
6. Ejecutar `npm run prisma:deploy` solo si aplica.
7. Ejecutar `npm run seed:admin` solo si falta el admin.
8. Iniciar con `npm start`.
9. Probar `/health`, `/health?database=1` y enviar un codigo de correo desde Perfil.

## Recomendacion importante

No reutilices credenciales locales en produccion. Usa claves nuevas para MySQL, `JWT_SECRET`, admin y correo SMTP.
