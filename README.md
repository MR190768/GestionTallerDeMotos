# Sistema de Gestión para Taller de Motocicletas

Este repositorio contiene el Backend (Node.js/Express) y el Frontend (React Native/Expo) de un sistema de gestión y control de taller de motocicletas.

## Arquitectura

El sistema está dividido en dos partes principales:
1. **Backend**: API RESTful construida con Node.js, Express y MySQL. Sigue una arquitectura limpia de N-Capas (Rutas -> Controladores -> Servicios -> Repositorios).
2. **Frontend**: Aplicación móvil construida con React Native y Expo SDK 56.

## Control de Acceso Basado en Roles (RBAC)

El sistema cuenta con dos roles principales:
- **Administrador (`admin`)**: Acceso total al sistema. Es el único que puede gestionar usuarios y finanzas (deudas/pagos).
- **Mecánico (`mecanico`)**: Acceso limitado a la gestión del taller operativo (clientes, motocicletas, repuestos, servicios). No tiene acceso a la gestión de usuarios ni módulos financieros.

### Credenciales por defecto
Al inicializar la base de datos con `init.sql`, se crea un usuario administrador por defecto:
- **Email**: `admin@taller.com`
- **Contraseña**: `password`

## Instrucciones de Ejecución

### Backend

#### Requisitos Previos
- Node.js (v16 o superior)
- MySQL (v8.0 o superior)

#### Pasos
1. Navega a la carpeta `backend/`.
2. Ejecuta `npm install`.
3. Configura tus variables de entorno en un archivo `.env` (puedes usar `.env.example` como base).
4. Inicializa tu base de datos MySQL usando el script provisto en `backend/database/init.sql`.
5. Inicia el servidor con `npm run dev`.

### Frontend

#### Requisitos Previos
- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Aplicación Expo Go en tu dispositivo móvil o un Emulador configurado.

#### Pasos
1. Navega a la carpeta `frontend/`.
2. Ejecuta `npm install`.
3. Configura tu IP local en el archivo `.env` (ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.31:3000/api`).
4. Inicia la aplicación con `npm start` o `npx expo start --lan`.
5. **Importante**: Para que la app en un dispositivo físico o emulador pueda comunicarse con tu API local, cambia `http://localhost:3000/api` en tu archivo `.env` por la **dirección IP de tu máquina** en la red local (ej. `EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api`). Si se usa expo go descargar https://expo.dev/go?sdkVersion=56&platform=android&device=true SDK 56, si localmente no se conecta utilizar > $env:REACT_NATIVE_PACKAGER_HOSTNAME="tu_ip" npx expo start  y escanea el código QR con Expo Go (en Android) o usa la aplicación de Cámara (en iOS).