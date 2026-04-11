# Despliegue en Hostinger

Esta aplicacion es un backend Node.js + Express + Prisma + MySQL. No debe subirse como sitio estatico normal.

## 1. Verifica tu plan

Necesitas uno de estos escenarios:

- `Business` o `Cloud` con soporte para `Node.js Web App`
- `VPS` si quieres control manual total

Si tu plan solo admite HTML/PHP estatico, este backend no va a correr ahi.

## 2. Prepara la base de datos en Hostinger

En hPanel:

1. Entra a `Websites`.
2. Abre el sitio donde vivira la app.
3. Ve a `Databases Management`.
4. Crea una base de datos MySQL y un usuario.
5. Guarda estos datos:
   - nombre de la base
   - usuario
   - password
   - host
   - puerto

Notas:

- Si la app corre dentro de Hostinger, normalmente el host sera `localhost`.
- Si conectas desde fuera de Hostinger, normalmente usara host remoto y puerto `3306`.

## 3. Configura variables de entorno

En Hostinger configura estas variables:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Ejemplo de `DATABASE_URL`:

```env
DATABASE_URL="mysql://USUARIO:CLAVE@localhost:3306/NOMBRE_BD"
```

Si Hostinger te da un host remoto, cambia `localhost` por ese valor.

## 4. Sube el proyecto

Tienes dos formas recomendadas:

- Conectar repositorio GitHub a Hostinger
- Subir un `.zip` del proyecto

Debes incluir:

- `src/`
- `public/`
- `prisma/`
- `package.json`
- `package-lock.json`

No subas:

- `node_modules/`
- `.env`

## 5. Configuracion de arranque

La app ya esta lista para arrancar con:

```bash
npm start
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
npx prisma migrate deploy
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
{ "status": "ok", "database": "ok" }
```

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
7. Ejecutar `npx prisma migrate deploy`
8. Ejecutar `npm run seed:admin`
9. Iniciar con `npm start`
10. Probar `/health`

## Recomendacion importante

Tu `.env` local tenia credenciales reales de desarrollo. Antes de pasar a produccion:

- cambia la clave del admin
- cambia el `JWT_SECRET`
- usa credenciales nuevas para la base de datos de produccion
