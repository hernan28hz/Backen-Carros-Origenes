# Backend Inventario de Vehiculos

API REST en Node.js + Express + Prisma + MySQL con autenticacion JWT y control de roles (`ADMIN`, `OPERADOR`).

## Requisitos

- Node.js 20+
- MySQL

## Configuracion rapida

1. Instalar dependencias:
   `npm install`
2. Configurar variables en `.env`.
3. Generar cliente Prisma:
   `npm run prisma:generate`
4. Crear tablas en la base de datos:
   `npm run prisma:push`
5. Crear usuario administrador:
   `npm run seed:admin`
6. Iniciar servidor:
   `npm run dev`

## Nota Para Desarrollo Local

`127.0.0.1` solo funciona en local si tienes MySQL corriendo en tu propia maquina. Si tu base vive en Hostinger u otro proveedor, tu `.env` local debe usar el host remoto real de esa base, no `127.0.0.1`.

## Endpoints principales

- `POST /auth/login`
- `POST /users` (solo `ADMIN`)
- `POST /vehicles` (`ADMIN` o `OPERADOR`)
- `GET /vehicles` (`ADMIN` ve todos, `OPERADOR` ve los suyos)
- `GET /vehicles/:id`
- `PATCH /vehicles/:id/status`
- `POST /vehicles/:id/photos` (form-data con campo `photo`)
- `GET /admin/vehicles/status` (solo `ADMIN`)
- `GET /health`
