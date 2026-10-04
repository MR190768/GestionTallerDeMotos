import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line, G } from 'react-native-svg';
import colors from '../../theme/colors';

/**
 * ====================================================================
 * BIBLIOTECA CENTRALIZADA DE ICONOS VECTORIALES (SVG)
 * ====================================================================
 * Diseñados para reemplazar emojis de texto con gráficos vectoriales
 * nítidos, escalables y con colores semánticos personalizables.
 */

// 1. Motocicleta
export const MotorcycleIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Circle cx="5.5" cy="17.5" r="3.5" />
    <Circle cx="18.5" cy="17.5" r="3.5" />
    <Path d="M15 6h-3l-2 5h-4" />
    <Path d="M14 17.5l-3-6.5h-5" />
    <Path d="M15 6l3.5 11.5" />
    <Path d="M14 6l1.5-2h2" />
  </Svg>
);

// 2. Usuario Individual
export const UserIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// 3. Grupo de Usuarios / Clientes
export const UsersIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// 4. Llave / Mantenimiento / Servicios
export const WrenchIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Svg>
);

// 5. Engranaje / Repuestos / Piezas
export const GearIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

// 6. Efectivo / Finanzas
export const CashIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Rect x="2" y="6" width="20" height="12" rx="2" />
    <Circle cx="12" cy="12" r="2.5" />
    <Path d="M6 12h.01M18 12h.01" />
  </Svg>
);

// 7. Tarjeta Bancaria
export const CardIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Rect x="2" y="5" width="20" height="14" rx="2" />
    <Line x1="2" y1="10" x2="22" y2="10" />
    <Line x1="6" y1="15" x2="10" y2="15" />
  </Svg>
);

// 8. Banco / Transferencia Bancaria
export const BankIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Line x1="3" y1="21" x2="21" y2="21" />
    <Line x1="3" y1="10" x2="21" y2="10" />
    <Polyline points="3 10 12 4 21 10" />
    <Line x1="6" y1="10" x2="6" y2="21" />
    <Line x1="10" y1="10" x2="10" y2="21" />
    <Line x1="14" y1="10" x2="14" y2="21" />
    <Line x1="18" y1="10" x2="18" y2="21" />
  </Svg>
);

// 9. Escudo / Roles / Seguridad
export const ShieldIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

// 10. Paquete / Caja de Repuestos
export const PackageIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Polyline points="3.29 7 12 12.01 20.71 7" />
    <Line x1="12" y1="22.08" x2="12" y2="12" />
  </Svg>
);

// 11. Portapapeles / Documento / Historial
export const ClipboardIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <Line x1="9" y1="12" x2="15" y2="12" />
    <Line x1="9" y1="16" x2="13" y2="16" />
  </Svg>
);

// 12. Lupa / Búsqueda
export const SearchIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

// 13. Verificación (Checkmark)
export const CheckIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

// 14. Círculo de Éxito / Pagado
export const CheckCircleIcon = ({ size = 20, color = colors.success, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="16 9 10.5 14.5 8 12" />
  </Svg>
);

// 15. Cerrar / Cruz
export const CloseIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

// 16. Basurero / Eliminar
export const TrashIcon = ({ size = 20, color = colors.danger, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
  </Svg>
);

// 17. Flecha Derecha (Chevron / Navegación)
export const ChevronRightIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

// 18. Flecha Abajo (Dropdown / Expandir)
export const ChevronDownIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Polyline points="6 9 12 15 18 9" />
  </Svg>

);

// 19. Signo Más / Agregar
export const PlusIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

// 20. Teléfono
export const PhoneIcon = ({ size = 20, color = colors.text, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);
