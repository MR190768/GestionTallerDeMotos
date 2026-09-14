# Guía de Desarrollo (Development Guidelines)

## Estructura del Proyecto

### Backend (Node.js + Express)
Se utiliza una **Arquitectura de N-Capas** estricta:
- **Routes (`/routes`)**: Definen los endpoints, asocian los middlewares de autenticación (`authMiddleware`) y roles (`roleMiddleware`), y delegan la solicitud al controlador correspondiente.
- **Controllers (`/controllers`)**: Extraen los parámetros de la petición (req.body, req.params), llaman a los servicios con estos datos y devuelturnen la respuesta HTTP (res.json, res.status). **No deben contener lógica de negocio**.
- **Services (`/services`)**: Contienen toda la lógica de negocio, validaciones y reglas (ej. hasheo de contraseñas, validación de stock). Llaman a los repositorios.
- **Repositories (`/repositories`)**: Encargados exclusivos de la interacción con la base de datos (queries SQL). 

### Frontend (React Native + Expo)
- **`/src/api`**: Configuración de Axios e interceptores (inyección del JWT).
- **`/src/context`**: Estado global. `AuthContext` maneja la sesión y los roles.
- **`/src/navigation`**: Navegación condicional. El `MainNavigator` lee el rol del usuario (del `AuthContext`) y dirige a pantallas distintas (`AdminDashboard` o `MechanicDashboard`).
- **`/src/screens`**: Componentes de pantalla organizados por funcionalidad (`auth`, `admin`, `mechanic`).
- **`/src/theme`**: Constantes de colores y estilos globales.

## Sistema de Roles (RBAC)
Para proteger un endpoint en el backend:
\`\`\`javascript
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Solo administradores
router.use(authMiddleware, roleMiddleware(['admin']));

// Administradores y mecánicos
router.use(authMiddleware, roleMiddleware(['admin', 'mecanico']));
\`\`\`

En el frontend, el acceso se restringe mediante condicionales en la navegación (evitando que el componente siquiera se renderice/monte para usuarios sin acceso).

## Estándares de Código
- Todo el código en el frontend (UI, placeholders, botones) **debe estar en español**.
- Utilizar `try/catch` en controladores y servicios (lanzar errores desde servicios con `status` personalizado y procesarlos en el manejador de errores global del controlador).
- Utilizar variables de entorno tanto en Backend (puerto, host, base de datos) como en Frontend (URL de la API).
