import { Alert } from 'react-native';

/**
 * Maneja errores de peticiones HTTP en el frontend de forma centralizada.
 * Detecta específicamente cuando no hay conexión con el servidor backend
 * (servidor apagado, IP incorrecta en .env, corte de red, timeout).
 */
export const handleApiError = (
  error,
  fallbackTitle = 'Error',
  fallbackMessage = 'Ocurrió un error inesperado al comunicarse con el servidor'
) => {
  // Caso 1: Sin respuesta del servidor (Error de Red / Conexión)
  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    Alert.alert(
      '⚠️ Error de Conexión con el Servidor',
      isTimeout
        ? 'El servidor tardó demasiado en responder (Tiempo de espera agotado).\n\nVerifica que tu backend esté funcionando correctamente.'
        : 'No fue posible conectarse con el servidor backend del taller.\n\n' +
          'Por favor verifica lo siguiente:\n' +
          '1. Que el backend de Node.js esté encendido en tu computadora (npm run dev).\n' +
          '2. Que tu teléfono/emulador y tu PC estén en la misma red Wi-Fi.\n' +
          '3. Que la IP en frontend/.env (EXPO_PUBLIC_API_URL) sea la IP local de tu PC.\n\n' +
          'Detalle técnico: ' + (error.message || 'Error de red'),
      [{ text: 'Entendido', style: 'default' }]
    );
    return;
  }

  // Caso 2: El servidor respondió con un error HTTP
  const status = error.response.status;
  const message =
    error.response.data?.message ||
    error.response.data?.error ||
    fallbackMessage;

  if (status === 403) {
    Alert.alert('Acceso Denegado', message || 'No tienes permisos suficientes para realizar esta acción.');
  } else if (status === 404) {
    Alert.alert('No Encontrado', message);
  } else if (status === 500) {
    Alert.alert('Error del Servidor', 'Ocurrió un fallo interno en el servidor: ' + message);
  } else {
    Alert.alert(fallbackTitle, message);
  }
};

/**
 * Retorna un texto amigable para mostrar en estados vacíos o subtítulos en caso de error.
 */
export const getErrorMessage = (error, defaultMsg = 'Error al cargar los datos') => {
  if (!error.response) {
    return 'No se pudo conectar con el servidor backend. Verifica tu conexión de red.';
  }
  return error.response.data?.message || error.response.data?.error || defaultMsg;
};
