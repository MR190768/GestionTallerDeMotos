import axiosClient from '../api/axiosClient';

/**
 * Obtiene el resumen financiero global (KPIs: Facturado, Recaudado, Saldo pendiente).
 */
export const getFinancialSummary = async () => {
  const response = await axiosClient.get('/debts-payments/summary');
  return response.data;
};

/**
 * Obtiene la lista de órdenes de servicio con su estatus de pago y saldos.
 * Admite { search, paymentStatus }
 */
export const getServicesPaymentStatus = async (params = {}) => {
  const cleanParams = {};
  if (params.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params.paymentStatus && params.paymentStatus !== 'ALL') {
    cleanParams.paymentStatus = params.paymentStatus;
  }

  const response = await axiosClient.get('/debts-payments/services', {
    params: cleanParams,
  });
  return response.data;
};

/**
 * Obtiene la ficha financiera de una orden de servicio con la lista de sus pagos.
 */
export const getServiceFinanceDetail = async (serviceId) => {
  const response = await axiosClient.get(`/debts-payments/services/${serviceId}`);
  return response.data;
};

/**
 * Obtiene el historial cronológico de todas las transacciones de pago.
 */
export const getTransactions = async (params = {}) => {
  const cleanParams = {};
  if (params.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }

  const response = await axiosClient.get('/debts-payments/transactions', {
    params: cleanParams,
  });
  return response.data;
};

/**
 * Registra un nuevo abono o pago a una orden de servicio.
 * data: { serviceId, amount, paymentMethod, notes }
 */
export const registerPayment = async (data) => {
  const response = await axiosClient.post('/debts-payments/pay', data);
  return response.data;
};