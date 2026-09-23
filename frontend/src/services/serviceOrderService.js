import axiosClient from '../api/axiosClient';

const getAllServices = async () => {
  const response = await axiosClient.get('/services');
  return response.data;
};

const getServiceById = async (id) => {
  const response = await axiosClient.get(`/services/${id}`);
  return response.data;
};

const createService = async (serviceData) => {
  const response = await axiosClient.post('/services', serviceData);
  return response.data;
};

const updateService = async (id, serviceData) => {
  const response = await axiosClient.put(`/services/${id}`, serviceData);
  return response.data;
};

const updateServiceStatus = async (id, status) => {
  const response = await axiosClient.patch(`/services/${id}/status`, {
    status,
  });

  return response.data;
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
};