# Backend Carros

API REST construida con Node.js, Express y Prisma para gestionar inventario de vehiculos, usuarios, estados, fotografias, finanzas y alertas por vencimientos.

## Caracteristicas

- Autenticacion con JWT
- Gestion de usuarios con roles `ADMIN`, `DIRECTOR` y `GERENTE`
- CRUD de vehiculos
- Historial de estados y detalles administrativos por vehiculo
- Carga y eliminacion de fotos
- Catalogo publico de vehiculos
- Modulo de finanzas
- Auditoria de cambios en usuarios, vehiculos, fotos y finanzas
- Verificacion de correo de contacto por codigo
- Alertas por correo para vencimientos de SOAT, tecnomecanica e impuesto vehicular
- Frontend estatico servido desde `public/`
- Variantes optimizadas de imagen con `sharp`

## Stack

- Node.js 20+
- Express 5
- Prisma ORM
- MySQL
- Zod
- JWT
- bcryptjs
- multer
- nodemailer
- sharp

## Estructura

```text
src/
  app.js
  server.js
  config/
  middlewares/
  modules/
    auth/
    users/
    vehicles/
    status/
    photos/
    admin/
    catalog/
    images/
    finance/
  services/
  scripts/
  utils/
prisma/
public/
uploads/
```

## Requisitos

- Node.js `>=20.9.0`
- npm
- MySQL accesible desde `DATABASE_URL`

## Instalacion

```bash
npm install
```

## Variables de entorno

Variables obligatorias:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/base_de_datos"
JWT_SECRET="una_clave_segura"
```

Variables recomendadas:

```env
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=8h
APP_NAME="Grupo w logist"
APP_URL="http://localhost:3000"

ADMIN_NAME="Administrator"
ADMIN_PASSWORD="cambia-esta-clave"

SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="atencion@grupowlogist.com"
SMTP_PASSWORD="tu_password_smtp"
SMTP_FROM="atencion@grupowlogist.com"
```

Notas:

- `ADMIN_PASSWORD` es necesaria si vas a ejecutar el seed del administrador.
- El seed usa el correo principal fijo `admin01@grupowlogist.com`.
- Si no configuras SMTP, las funciones de verificacion y alertas por correo no podran enviar mensajes.

## Base de datos

Generar cliente Prisma:

```bash
npm run prisma:generate
```

Sincronizar esquema con la base de datos:

```bash
npm run prisma:push
```

Si prefieres trabajar con migraciones en desarrollo:

```bash
npm run prisma:migrate
```

Crear o actualizar el administrador principal:

```bash
npm run seed:admin
```

## Ejecucion

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Prueba rapida:

```bash
GET /health
```

Respuesta esperada:

```json
{ "status": "ok" }
```

## Scripts disponibles

```bash
npm run dev
npm start
npm run prisma:generate
npm run prisma:push
npm run prisma:migrate
npm run prisma:studio
npm run seed:admin
```

## Roles y acceso

- `ADMIN`: acceso total a vehiculos, usuarios, fotos, estados y panel administrativo.
- `DIRECTOR`: lectura de usuarios y vehiculos.
- `GERENTE`: lectura de usuarios y vehiculos, y acceso a finanzas.

Reglas actuales importantes:

- Solo `ADMIN` puede crear, editar o eliminar vehiculos.
- Solo `ADMIN` puede subir o eliminar fotos de vehiculos.
- Solo `ADMIN` puede cambiar estados de vehiculos.
- Solo `ADMIN` puede gestionar usuarios.
- Finanzas requieren usuario `GERENTE` o el administrador principal.
- `GET /admin/administrators` solo lo puede consultar el administrador principal.

## Endpoints principales

### Salud

- `GET /health`

### Autenticacion

- `POST /auth/login`

### Usuarios

- `POST /users`
- `GET /users`
- `GET /users/me`
- `POST /users/me/email-verification/request`
- `POST /users/me/email-verification/confirm`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Vehiculos

- `POST /vehicles`
- `GET /vehicles`
- `GET /vehicles/:id`
- `PATCH /vehicles/:id/details`
- `DELETE /vehicles/:id`
- `PATCH /vehicles/:id/status`
- `POST /vehicles/:id/photos`
- `DELETE /vehicles/:id/photos/:photoId`

### Administracion

- `GET /admin/vehicles/status`
- `GET /admin/operators`
- `GET /admin/administrators`

### Finanzas

- `GET /finance`
- `GET /finance/summary`
- `POST /finance`
- `PATCH /finance/:id`
- `DELETE /finance/:id`

### Catalogo publico

- `GET /catalog/vehicles`

### Imagenes optimizadas

- `GET /images/vehicles/:fileName?w=640`

La ruta de imagenes genera una variante optimizada segun el ancho pedido y el formato soportado por el cliente.

## Frontend y archivos estaticos

- `public/` contiene el frontend estatico.
- `uploads/vehicles/` guarda las fotos originales.
- `uploads/.cache/vehicles/` guarda variantes procesadas de imagen.
- El backend responde `public/index.html` en rutas de interfaz como:
  - `/`
  - `/login`
  - `/catalogo`
  - `/dashboard`
  - `/perfil`
  - `/vehiculo/:id`
  - `/admin/vehiculos`
  - `/admin/operadores`
  - `/admin/mensajes`
  - `/finanzas`

## Alertas de vencimiento

Al iniciar el servidor se activa un proceso que revisa vencimientos y envia alertas por correo:

- 5 dias antes del vencimiento
- 1 dia antes del vencimiento
- 1 dia despues del vencimiento

Documentos revisados:

- SOAT
- Tecnomecanica
- Impuesto vehicular

Para que estas alertas funcionen:

- el vehiculo debe tener fecha de vencimiento cargada
- el usuario creador debe tener `contactEmail`
- el correo de contacto debe estar verificado
- SMTP debe estar configurado

## Modelo de datos principal

Entidades principales en Prisma:

- `User`
- `Vehicle`
- `VehicleStatusHistory`
- `VehicleAdminHistory`
- `VehiclePhoto`
- `FinanceRecord`
- `EmailVerification`
- `VehicleComplianceNotification`
- `AuditLog`

## Errores comunes

### Falta una variable obligatoria

```text
Missing required environment variable: DATABASE_URL
```

o

```text
Missing required environment variable: JWT_SECRET
```

Solucion: revisar el archivo `.env`.

### Prisma Client no generado

```text
PrismaClient is not generated
```

Solucion:

```bash
npm run prisma:generate
```

### Error de conexion a MySQL

Solucion: validar `DATABASE_URL`, credenciales, puerto y que el motor este disponible.

### No se envian correos

Solucion: revisar `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `SMTP_FROM`.

## Estado actual de la documentacion

Este `README` fue actualizado para reflejar la estructura y las rutas vigentes del proyecto al 22 de julio de 2026.
