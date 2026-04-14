# 🚗 Backend Sistema de Inventario de Vehículos - Orígenes Fleet

API REST completa en Node.js + Express + Prisma + MySQL con interfaz web moderna, autenticación JWT y control de roles avanzado.

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- **Autenticación JWT** con tokens seguros
- **Dos roles principales**: `ADMIN` y `OPERADOR`
- **Control granular de permisos** por endpoint
- **Sesiones persistentes** con localStorage

### 👥 Gestión de Usuarios
- **Creación de usuarios** con roles ADMIN/OPERADOR
- **Edición de perfiles** (nombre, email, contraseña, estado)
- **Eliminación segura** de operadores (con validaciones)
- **Cualquier admin puede crear otros admins**
- **Visualización de lista de usuarios** por rol

### 🚗 Gestión Completa de Vehículos
- **CRUD completo** de vehículos
- **Campos detallados**: marca, modelo, año, VIN, placa, etc.
- **Sistema de estados**: REGISTERED, AVAILABLE, IN_MAINTENANCE, OUT_OF_SERVICE, SOLD
- **Historial de cambios** de estado
- **Campos administrativos** (solo visibles para admins)
- **Asignación de operadores** a vehículos

### 📸 Sistema de Fotografías
- **Subida múltiple** de fotos por vehículo
- **Validación de tipos** (JPEG, PNG, WebP)
- **Límite de tamaño** (5MB por foto)
- **Vista galería** organizada
- **Eliminación individual** de fotos
- **Permisos por propietario** del vehículo

### 🌐 Catálogo Público
- **Vista pública** sin autenticación
- **Navegación por estados** de vehículos
- **Información básica** de vehículos disponibles
- **Interfaz responsive** y moderna

### 📊 Panel de Administración
- **Dashboard global** con estadísticas
- **Vista de todos los vehículos** del sistema
- **Gestión de usuarios** (operadores y administradores)
- **Historial administrativo** de cambios
- **Mensajes del sistema** para auditoría

### 🛠️ API REST Robusta
- **Validación completa** con Zod
- **Manejo de errores** centralizado
- **Middleware de autenticación** y roles
- **Paginación** en listas
- **Filtros** por estado
- **Búsqueda** y ordenamiento

## 🏗️ Arquitectura Técnica

### Backend
- **Node.js 20+** con Express.js
- **Prisma ORM** para MySQL
- **JWT** para autenticación
- **bcryptjs** para hashing de contraseñas
- **multer** para subida de archivos
- **Zod** para validación
- **CORS** configurado

### Frontend
- **Vanilla JavaScript** (sin frameworks)
- **CSS moderno** con variables y responsive design
- **Componentes reutilizables**
- **SPA (Single Page Application)**
- **PWA-ready** con service worker básico

### Base de Datos
- **MySQL 8.0+**
- **Esquema Prisma** con migraciones
- **Relaciones complejas** (usuarios ↔ vehículos ↔ fotos ↔ estados)
- **Índices optimizados**

## 📋 Requisitos del Sistema

- **Node.js**: 20.0.0 o superior
- **MySQL**: 8.0 o superior
- **npm**: 9.0.0 o superior
- **Sistema operativo**: Windows, macOS, Linux

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias
```bash
git clone <repository-url>
cd backend-carros
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DATABASE_URL="mysql://usuario:contraseña@host:puerto/base_datos"

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=8h

# Admin inicial (opcional, para seeding)
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@origenesfleet.com
ADMIN_PASSWORD=tu_contraseña_segura
```

### 3. Configurar base de datos
```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:push

# Ejecutar migraciones (si existen)
npm run prisma:migrate
```

### 4. Crear usuario administrador inicial
```bash
npm run seed:admin
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## 📖 Uso de la Aplicación

### Acceso Inicial
1. **Usuario admin por defecto**:
   - Email: `admin@origenesfleet.com`
   - Contraseña: La configurada en `.env`

### Funcionalidades por Rol

#### 👑 Administrador (ADMIN)
- ✅ Crear, editar y eliminar usuarios (incluyendo otros admins)
- ✅ Gestionar todos los vehículos del sistema
- ✅ Ver estadísticas globales
- ✅ Acceder a historial administrativo
- ✅ Ver mensajes del sistema
- ✅ Todas las funciones de operador

#### 🔧 Operador (OPERADOR)
- ✅ Crear y gestionar sus propios vehículos
- ✅ Subir fotos a sus vehículos
- ✅ Cambiar estados de sus vehículos
- ✅ Ver catálogo público
- ✅ Acceder a su dashboard personal

## 🔗 Endpoints de la API

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `POST /users` - Crear usuario (solo ADMIN)
- `PATCH /users/:id` - Actualizar usuario (solo ADMIN)
- `DELETE /users/:id` - Eliminar usuario (solo ADMIN)

### Vehículos
- `POST /vehicles` - Crear vehículo (ADMIN/OPERADOR)
- `GET /vehicles` - Listar vehículos (filtrado por rol)
- `GET /vehicles/:id` - Detalles de vehículo
- `PATCH /vehicles/:id/details` - Actualizar detalles (ADMIN/OPERADOR)
- `DELETE /vehicles/:id` - Eliminar vehículo (ADMIN/OPERADOR)

### Estados de Vehículos
- `PATCH /vehicles/:id/status` - Cambiar estado (ADMIN/OPERADOR)

### Fotografías
- `POST /vehicles/:id/photos` - Subir foto (form-data)
- `DELETE /vehicles/:id/photos/:photoId` - Eliminar foto

### Catálogo Público
- `GET /catalogo` - Página principal del catálogo
- `GET /catalog/vehicles` - API de vehículos para catálogo

### Administración
- `GET /admin/vehicles/status` - Estadísticas globales (solo ADMIN)
- `GET /admin/operators` - Lista de operadores (solo ADMIN)
- `GET /admin/administrators` - Lista de administradores (solo ADMIN)

### Utilidades
- `GET /health` - Verificar estado del servidor

## 🎨 Interfaz de Usuario

### Diseño Moderno
- **Tema oscuro/profesional** con gradientes
- **Responsive design** para móviles y desktop
- **Animaciones suaves** y transiciones
- **Iconografía consistente** con Lucide icons

### Navegación
- **Sidebar responsive** con menú móvil
- **Navegación por rutas** sin recargas
- **Estados de carga** y indicadores visuales
- **Notificaciones toast** para feedback

### Componentes Interactivos
- **Formularios validados** en tiempo real
- **Modales y overlays** para acciones
- **Listas paginadas** con filtros
- **Galerías de imágenes** con lightbox
- **Gráficos de métricas** con barras animadas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor con nodemon
npm run start        # Iniciar servidor en producción

# Base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:push      # Sincronizar esquema con DB
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio

# Seeding
npm run seed:admin   # Crear admin inicial

# Testing
npm run test         # Ejecutar tests (si existen)
```

## 🚀 Despliegue en Producción

### Variables de Entorno para Producción
```env
NODE_ENV=production
DATABASE_URL="mysql://prod_user:prod_pass@prod_host:3306/prod_db"
JWT_SECRET=clave_muy_segura_para_produccion
```

### Comandos de Despliegue
```bash
npm run prisma:migrate
npm run build  # Si tienes build step
npm start
```

## 🐛 Solución de Problemas

### Error de conexión a MySQL
```
PrismaClientInitializationError: Can't reach database server
```
**Solución**: Verificar que MySQL esté ejecutándose y las credenciales en `.env` sean correctas.

### Error de puerto ocupado
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solución**: Cambiar el puerto en `.env` o liberar el puerto 5000.

### Error de Prisma Client
```
PrismaClient is not generated
```
**Solución**: Ejecutar `npm run prisma:generate`

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para Orígenes Fleet**
