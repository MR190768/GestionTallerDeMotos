# Guía de Desarrollo (Development Guidelines)

## Estructura del Proyecto

### Backend (Node.js + Express)
Se utiliza una **Arquitectura de N-Capas** estricta:
- **Routes (`/routes`)**: Definen los endpoints, asocian los middlewares de autenticación (`authMiddleware`) y roles (`roleMiddleware`), y delegan la solicitud al controlador correspondiente.
- **Controllers (`/controllers`)**: Extraen los parámetros de la petición (req.body, req.params), llaman a los servicios con estos datos y devuelven la respuesta HTTP (res.json, res.status). **No deben contener lógica de negocio**.
- **Services (`/services`)**: Contienen toda la lógica de negocio, validaciones y reglas (ej. hasheo de contraseñas, validación de stock). Llaman a los repositorios.
- **Repositories (`/repositories`)**: Encargados exclusivos de la interacción con la base de datos (queries SQL). 

### Frontend (React Native + Expo)
- **`/src/api`**: Configuración de Axios e interceptores (inyección del JWT).
- **`/src/context`**: Estado global. `AuthContext` maneja la sesión y los roles.
- **`/src/navigation`**: Navegación condicional. El `MainNavigator` lee el rol y permisos del usuario (del `AuthContext`) y dirige a pantallas de inicio (`AdminDashboard` o `UserDashboard`).
- **`/src/screens`**: Componentes de pantalla organizados por funcionalidad (`auth`, `admin`, `dashboard`, `clients`, `motorcycles`, `services`, `parts`, `debts`).
- **`/src/theme/colors.js`**: **Paleta oficial y única de colores globales**.

---

## 🎨 Paleta de Colores Global (Obligatoria para Toda Nueva Pantalla)

Para asegurar coherencia visual en todo el sistema del taller, **está estrictamente prohibido utilizar colores hexadecimales hardcodeados** en los estilos de los componentes. Siempre se debe importar el archivo central de temas:

\`\`\`javascript
import colors from '../theme/colors'; // Ajustar ruta relativa según la ubicación
\`\`\`

### Fondos y Colores Oficiales:
| Color Hex | Nombre Semántico | Uso Principal en la App |
| :--- | :--- | :--- |
| **`#FFFFFF`** | `colors.background` / `colors.surface` | **Fondo blanco oficial para todas las pantallas (screens)**, tarjetas e inputs. |
| **`#333131`** | `colors.text` / `colors.headerBackground` | Texto principal sobre fondo blanco y fondo de la barra de navegación. |
| **`#4D5250`** | `colors.textSecondary` / `colors.secondary` | Subtítulos, textos secundarios y divisores. |
| **`#4D524D`** | `colors.border` / `colors.slateMuted` | Bordes de inputs, tarjetas y separadores. |
| **`#D14B4B`** | `colors.danger` / `colors.error` | Botones de cierre de sesión, eliminación, errores y deudas. |
| **`#4BD19F`** | `colors.primary` / `colors.successHighlight` | Acciones principales, botones destacados, indicadores de éxito y estados activos. |

### Ejemplo de Implementación en una Nueva Pantalla:
\`\`\`javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../theme/colors';

export default function MiNuevaPantalla() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Título de la Pantalla</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardText}>Contenido dentro de una tarjeta</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.buttonText}>Acción Principal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // #FFFFFF (Fondo blanco)
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text, // #333131 (Texto oscuro nítido)
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card, // #FFFFFF (Tarjeta blanca)
    borderColor: colors.border,   // #4D524D (Borde elegante)
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary, // #4BD19F
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textDark, // #333131 (contraste sobre verde menta)
    fontWeight: 'bold',
    fontSize: 16,
  }
});
\`\`\`

---

## Sistema de Control de Acceso Basado en Roles (RBAC Dinámico)

El sistema soporta permisos granulares y dinámicos asignados a roles creados por el administrador.

Para proteger endpoints en el backend se utiliza `permissionMiddleware` (o `roleMiddleware` para compatibilidad de roles):
\`\`\`javascript
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Proteger ruta con un permiso específico (ej. gestión de roles o usuarios)
router.use(authMiddleware);
router.use(permissionMiddleware('manage_roles'));

// Proteger con múltiples permisos (si tiene al menos uno de ellos)
router.use(permissionMiddleware(['manage_clients', 'manage_services']));

// O verificar por nombre de rol
router.use(roleMiddleware(['Administrador']));
\`\`\`

> **Nota:** El usuario con rol `Administrador` (ID: 1) cuenta automáticamente con bypass de acceso completo en el middleware de permisos.

En el frontend, la información del usuario (`userInfo`) incluye su `roleId`, `role` (nombre) y el array `permissions`. Puedes restringir navegación y vistas validando si el permiso requerido está presente en `userInfo.permissions`.

---

## Estándares de Código
- Todo el código en el frontend (UI, placeholders, botones) **debe estar en español**.
- Utilizar `try/catch` en controladores y servicios (lanzar errores desde servicios con `status` personalizado y procesarlos en el manejador de errores global del controlador).
- Utilizar variables de entorno tanto en Backend (puerto, host, base de datos) como en Frontend (URL de la API).
- No escribir estilos con colores arbitrarios: **utilizar siempre `colors` desde `src/theme/colors.js`**.
