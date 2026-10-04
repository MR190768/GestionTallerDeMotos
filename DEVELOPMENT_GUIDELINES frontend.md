# Guía de Desarrollo - Frontend Móvil (Arquitectura N-Capas)

## Arquitectura Limpia en React Native
Este proyecto separa estrictamente la Interfaz de Usuario (Presentación) de las peticiones HTTP y el estado global.

### Capas:
1. **`api/axiosClient.js`**: Cliente configurado de Axios. Aquí se inyectan cabeceras como el `Authorization: Bearer <token>` de forma automática. **No uses `fetch` o `axios` crudo en tus componentes.**
2. **`services/`**: Métodos específicos de negocio que llaman al `axiosClient` (ej. `clientService.js`).
3. **`context/`**: Estado global como autenticación (maneja los tokens seguros mediante `expo-secure-store`).
4. **`screens/`**: Vistas exclusivas de React Native (Hooks y JSX). 
5. **`navigation/`**: Navegación. Se separa entre rutas protegidas (`MainNavigator`) y públicas (`AuthNavigator`).

## Cómo Agregar un Nuevo Módulo/Pantalla
1. **Crea el Servicio**: Añade las peticiones a la API en `src/services/[nombre]Service.js`.
2. **Crea la Pantalla**: Diseña tu UI en `src/screens/[modulo]/[Pantalla]Screen.js`.
   - Usa el servicio importándolo para traer los datos dentro de un `useEffect`.
3. **Agrega la Ruta**: Ve a `src/navigation/MainNavigator.js` e importa tu nueva pantalla, agregándola como un `Stack.Screen`.

### Reglas de Oro (Anti-Conflictos y Mantenibilidad)
- **Vistas Mudas**: La vista no debe saber qué endpoint se consume, solo invoca la función del `Service`.
- **Un archivo, un componente**: No pongas más de un componente React exportado en un archivo. Divide componentes reutilizables y ponlos en `src/components/`.
- **Estilos Centralizados**: Evita colores en duro, usa `src/theme/colors.js` para mantener un diseño unificado.
- **Gestión de Errores**: Si el servicio falla, la vista (Screen) captura el error usando `try/catch` y muestra un `Alert` o un UI de error amigable.