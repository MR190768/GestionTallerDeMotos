# Guía de Desarrollo y Convenciones (N-Capas)

## Arquitectura del Proyecto
Este proyecto sigue una arquitectura de N-capas. El objetivo es mantener el código altamente desacoplado, modular y fácil de testear.

### Capas
1. **Rutas (`routes/`)**: Define los endpoints de la API y los asocia con los métodos de los controladores. **No debe contener lógica de negocio**.
2. **Controladores (`controllers/`)**: Recibe la petición HTTP (`req`), extrae parámetros, llama al servicio correspondiente y devuelve la respuesta HTTP (`res`).
3. **Servicios (`services/`)**: Contiene toda la **lógica de negocio**. Valida reglas operativas y llama a la capa de persistencia (Repositorios). **No debe saber nada de Express (ni req ni res)**.
4. **Repositorios (`repositories/`)**: Capa de persistencia. Contiene las consultas SQL crudas o llamadas al ORM. Es el **único lugar** donde se interactúa con la base de datos (`mysql2`).

## Cómo agregar una nueva funcionalidad (Endpoint)
Sigue siempre este orden de abajo hacia arriba o de arriba hacia abajo, manteniendo la separación:

1. **Ruta**: Agrega el endpoint en el archivo `routes/entity.routes.js`. Si es un módulo nuevo, agrégalo al `routes/index.js`.
2. **Controlador**: Crea la función en `controllers/entity.controller.js`, llamando al método del servicio.
3. **Servicio**: Escribe la lógica en `services/entity.service.js`. Aquí realizas comprobaciones complejas y lanzas errores si algo falla.
4. **Repositorio**: Crea la función que ejecuta el query en `repositories/entity.repository.js`.

### Reglas de Aislamiento
- **La Ruta SOLO llama al Controlador.**
- **El Controlador SOLO delega en el Servicio.**
- **El Servicio SOLO interactúa con el Repositorio.** No lances respuestas HTTP (`res.status`) desde el servicio. Lanza un `Error` (ej. `const error = new Error('Message'); error.status = 404; throw error;`) y el middleware de errores global lo procesará.

## Estrategia Anti-Conflictos de Merge
- **Separación de Archivos:** No crees archivos gigantes. Si un controlador crece mucho, divídelo por sub-recursos. Utiliza los esqueletos proveídos para cada módulo de forma aislada.
- **Ramas (Branches):** Crea una rama por cada "feature" (ej. `feature/users-crud`, `feature/motorcycles-status`).
- **Nombres y Convenciones:** 
  - Archivos: `modulo.capa.js` (ej. `clients.controller.js`).
  - Variables: `camelCase`.
- **Manejo de Errores Estándar:** Usa siempre la función `next(error)` en el bloque `catch` del controlador para que el `errorMiddleware` genere una respuesta JSON consistente en toda la API.