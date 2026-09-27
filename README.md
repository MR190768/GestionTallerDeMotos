# Sistema de Gestión para Taller de Motocicletas

Este repositorio contiene el Backend (Node.js/Express) y el Frontend (React Native/Expo) de un sistema de gestión y control de taller de motocicletas.

## Arquitectura

El sistema está dividido en dos partes principales:
1. **Backend**: API RESTful construida con Node.js, Express y MySQL. Sigue una arquitectura limpia de N-Capas (Rutas -> Controladores -> Servicios -> Repositorios).
2. **Frontend**: Aplicación móvil construida con React Native y Expo SDK 56.

---

## Control de Acceso Basado en Roles Dinámico (RBAC)

El sistema cuenta con un modelo relacional de **Control de Acceso Basado en Roles (RBAC)** administrable en tiempo real:

- **Roles Dinámicos**: Los administradores pueden crear nuevos roles personalizados (ej. *Recepcionista*, *Jefe de Taller*, *Cajero*), configurar sus descripciones y asignar permisos granulares.
- **Catálogo de Permisos por Módulos**:
  - `manage_users`: Gestión total de usuarios (creación, asignación de rol, eliminación).
  - `manage_roles`: Creación, edición de roles y asignación de permisos.
  - `manage_clients`: Ver, registrar, editar y eliminar clientes.
  - `manage_motorcycles`: Ficha y administración de motocicletas.
  - `manage_services`: Órdenes de servicio y seguimiento de reparaciones.
  - `manage_parts`: Inventario y catálogo de repuestos.
  - `manage_finances`: Consulta y registro de deudas, abonos y pagos.
- **Roles Base Preconfigurados**:
  - **`Administrador` (ID: 1)**: Acceso total al sistema con todos los permisos asignados. Posee protecciones de integridad (no puede ser eliminado ni perder permisos críticos).
  - **`Mecánico` (ID: 2)**: Acceso operativo enfocado en clientes, motocicletas, repuestos y servicios de taller.

### Credenciales por Defecto
Al inicializar la base de datos con `init.sql`, se genera el usuario administrador inicial:
- **Email**: `admin@taller.com`
- **Contraseña**: `password`

---

## Endpoints de la API (RBAC)

### Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticación de usuario. Retorna el token JWT con los datos de rol y lista de permisos asociados.
- `POST /api/auth/logout`: Cierre de sesión.

### Gestión de Roles (`/api/roles`) - Requiere `manage_roles`
- `GET /api/roles`: Listar roles y conteo de permisos asignados.
- `GET /api/roles/:id`: Obtener el detalle de un rol y sus permisos activos.
- `GET /api/roles/permissions/all`: Obtener el catálogo completo de permisos agrupados por módulo.
- `POST /api/roles`: Crear un nuevo rol con permisos (`{ name, description, permissionIds }`).
- `PUT /api/roles/:id`: Modificar nombre, descripción o permisos de un rol existente.
- `DELETE /api/roles/:id`: Eliminar un rol (valida que no tenga usuarios vinculados y protege al Administrador).

### Gestión de Usuarios (`/api/users`) - Requiere `manage_users`
- `GET /api/users`: Listar usuarios con su rol correspondiente.
- `POST /api/users`: Registrar un nuevo usuario asignándole un `role_id`.
- `PUT /api/users/:id`: Actualizar datos o rol de un usuario.
- `DELETE /api/users/:id`: Eliminar usuario (protege la cuenta del Administrador principal).

---

## Instrucciones de Ejecución

### Backend

#### Requisitos Previos
- Node.js (v18 o superior)
- MySQL (v8.0 o superior)

#### Pasos
1. Navega a la carpeta `backend/`.
2. Ejecuta `npm install`.
3. Configura tus variables de entorno en el archivo `.env` (puedes usar `.env.example` como plantilla):
   ```env
   PORT=3000
   HOST=0.0.0.0
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=taller_motos
   JWT_SECRET=tu_secreto_seguro
   JWT_EXPIRES_IN=8h
   ```
4. Inicializa o actualiza tu base de datos MySQL ejecutando el script en `backend/database/init.sql`.
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Frontend

#### Requisitos Previos
- Node.js
- Expo CLI
- Dispositivo móvil con la app **Expo Go** (SDK 56) o un emulador Android/iOS.

#### Pasos
1. Navega a la carpeta `frontend/`.
2. Ejecuta `npm install`.
3. Configura tu IP local en el archivo `.env` (ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.31:3000/api`).
4. Inicia la aplicación con Metro Bundler:
   ```bash
   npm start
   # o bien:
   npx expo start --lan
   ```
5. **Importante**: Para que la app en un dispositivo físico o emulador pueda comunicarse con tu API local, cambia `http://localhost:3000/api` en tu archivo `.env` por la **dirección IP de tu máquina** en la red local (ej. `EXPO_PUBLIC_API_URL=http://192.168.1.31:3000/api`). Si Expo Go se conecta a una interfaz errónea en Windows, puedes forzar la IP con:
   ```powershell
   $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.31"; npx expo start --lan
   ```