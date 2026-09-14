/**
 * ====================================================================
 * PALETA DE COLORES GLOBAL OFICIAL DEL SISTEMA
 * ====================================================================
 * 
 * REGLA DE DESARROLLO OBLIGATORIA:
 * Toda nueva pantalla, componente, botón o vista DEBE importar y utilizar
 * esta paleta global para mantener consistencia visual en toda la aplicación.
 * 
 * Los 5 colores oficiales del sistema:
 *  - #333131: Carbón Oscuro (Textos principales, botones secundarios, cabeceras)
 *  - #4D5250: Gris Pizarra (Textos secundarios, divisores fuertes, insignias)
 *  - #4D524D: Pizarra Neutro (Bordes de inputs y tarjetas)
 *  - #D14B4B: Rojo Coral (Peligro, errores, logout, deudas)
 *  - #4BD19F: Verde Menta (Color primario, éxito, botones de acción)
 * 
 * Fondo de pantallas:
 *  - #FFFFFF: Blanco puro (para todas las pantallas/screens)
 */

export const palette = {
  charcoal: '#333131',
  slateDark: '#4D5250',
  slateMuted: '#4D524D',
  coralRed: '#D14B4B',
  mintGreen: '#4BD19F',
  white: '#FFFFFF',
  textMuted: '#7E8582',
};

const colors = {
  // Los 5 colores base de la paleta oficial
  charcoal: palette.charcoal,
  slateDark: palette.slateDark,
  slateMuted: palette.slateMuted,
  coralRed: palette.coralRed,
  mintGreen: palette.mintGreen,

  // Fondo de las pantallas (Blanco)
  background: palette.white,          // Fondo blanco para todas las screens (#FFFFFF)
  surface: palette.white,             // Superficie de tarjetas y modales (#FFFFFF)
  card: palette.white,                // Fondo de tarjetas (#FFFFFF)
  inputBackground: palette.white,     // Fondo blanco para campos de texto (#FFFFFF)

  // Roles semánticos de interacción
  primary: palette.mintGreen,         // Acción principal, botones (#4BD19F)
  secondary: palette.slateDark,       // Elementos secundarios (#4D5250)
  border: palette.slateMuted,         // Bordes de inputs y divisores (#4D524D)
  headerBackground: palette.charcoal, // Fondo de la barra superior / header (#333131)
  danger: palette.coralRed,           // Acciones de peligro, cancelar, logout, deudas (#D14B4B)
  error: palette.coralRed,            // Mensajes de error (#D14B4B)
  success: '#1B9A68',                 // Texto de éxito legible sobre blanco
  successHighlight: palette.mintGreen,// Destacados de éxito / botones (#4BD19F)

  // Tipografía (adaptada para lectura óptima sobre fondo blanco)
  text: palette.charcoal,             // Texto principal oscuro (#333131)
  textSecondary: palette.slateDark,   // Subtítulos y textos secundarios (#4D5250)
  textMuted: palette.textMuted,       // Placeholders e indicadores neutros (#7E8582)
  textLight: palette.white,           // Texto blanco para usar sobre botones/headers oscuros o de color
  textDark: palette.charcoal,         // Texto oscuro para usar sobre fondos menta

  // Auxiliares
  white: palette.white,
};

export default colors;