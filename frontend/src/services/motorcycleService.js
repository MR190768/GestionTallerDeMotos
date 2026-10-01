import axiosClient from '../api/axiosClient';

/**
 * Obtiene el listado de motocicletas. Admite búsqueda por placa, marca, modelo o cliente.
 */
export const getAllMotorcycles = async (search) => {
  const params = search && search.trim() ? { search: search.trim() } : {};
  const response = await axiosClient.get('/motorcycles', { params });
  return response.data;
};

/**
 * Obtiene el detalle de una motocicleta por ID, incluyendo historial de servicios.
 */
export const getMotorcycleById = async (id) => {
  const response = await axiosClient.get(`/motorcycles/${id}`);
  return response.data;
};

/**
 * Busca motocicletas por placa.
 */
export const searchMotorcycleByPlate = async (plate) => {
  const params = plate && plate.trim() ? { plate: plate.trim() } : {};
  const response = await axiosClient.get('/motorcycles/search-plate', { params });
  return response.data;
};

/**
 * Obtiene todas las motocicletas registradas a nombre de un cliente.
 */
export const getMotorcyclesByClient = async (clientId) => {
  const response = await axiosClient.get(`/motorcycles/client/${clientId}`);
  return response.data;
};

/**
 * Registra una nueva motocicleta vinculada a un cliente.
 */
export const createMotorcycle = async (motorcycleData) => {
  const response = await axiosClient.post('/motorcycles', motorcycleData);
  return response.data;
};

/**
 * Actualiza los datos de una motocicleta existente.
 */
export const updateMotorcycle = async (id, motorcycleData) => {
  const response = await axiosClient.put(`/motorcycles/${id}`, motorcycleData);
  return response.data;
};

/**
 * Elimina una motocicleta por ID.
 */
export const deleteMotorcycle = async (id) => {
  const response = await axiosClient.delete(`/motorcycles/${id}`);
  return response.data;
};