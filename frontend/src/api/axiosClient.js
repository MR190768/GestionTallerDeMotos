import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos de espera máxima antes de reportar fallo de conexión
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      // Error de conectividad o servidor fuera de línea
      error.isConnectionError = true;
    } else if (error.response.status === 401) {
      // Sesión expirada o token inválido
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;