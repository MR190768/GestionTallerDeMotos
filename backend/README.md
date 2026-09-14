# GestionTallerDeMotos - Backend

## Descripción General
Este es el backend para el sistema de Gestión de Taller de Motos. Está construido con Node.js, Express.js y MySQL, siguiendo una arquitectura de N-Capas estricta para asegurar escalabilidad y mantenibilidad.

## Requisitos Previos
- Node.js (v16 o superior)
- MySQL (v8.0 o superior)

## Instrucciones de Instalación y Configuración

1. **Clonar/Navegar al repositorio:**
   Navega a la carpeta `backend`.

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   Copia el archivo de ejemplo de variables de entorno y configúralo:
   ```bash
   cp .env.example .env
   ```
   Ajusta las variables en `.env` con tus credenciales de MySQL y secretos.

4. **Base de Datos:**
   Asegúrate de tener tu servidor MySQL corriendo y crea la base de datos especificada en tu archivo `.env` (ej. `taller_motos`). Es necesario crear la tabla de `users` para que el módulo de autenticación funcione.

5. **Levantar el Servidor:**
   - Para desarrollo (con recarga automática mediante nodemon):
     ```bash
     npm run dev
     ```
   - Para producción:
     ```bash
     npm start
     ```

## Scripts Disponibles
- `npm start`: Inicia la aplicación usando Node.js.
- `npm run dev`: Inicia la aplicación usando Nodemon para desarrollo (reinicia al detectar cambios).