# GestionTallerDeMotos - Frontend (React Native / Expo)

## Descripción
Aplicación móvil para la gestión del taller de motos, conectada al backend Node.js.

## Requisitos Previos
- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Aplicación Expo Go en tu dispositivo móvil o un Emulador configurado.

## Instalación
1. Clona el repositorio y navega a la carpeta `frontend`.
2. Instala dependencias:
   ```bash
   npm install
   ```

## Configuración de Entorno
1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. **Importante**: Para que la app en un dispositivo físico o emulador pueda comunicarse con tu API local, cambia `http://localhost:3000/api` en tu archivo `.env` por la **dirección IP de tu máquina** en la red local (ej. `EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api`).

## Ejecución
Inicia el servidor de desarrollo de Expo:
```bash
npx expo start
```
Escanea el código QR con Expo Go (en Android) o usa la aplicación de Cámara (en iOS).