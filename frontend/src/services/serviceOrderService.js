import axiosClient from '../api/axiosClient';

const getAllServices = async (status = 'ACTIVE') => {
  const response = await axiosClient.get('/services', {
    params: { status },
  });

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

const getServiceParts = async (id) => {
  const response = await axiosClient.get(`/services/${id}/parts`);
  return response.data;
};

const addPartToService = async (id, { partId, quantity }) => {
  const response = await axiosClient.post(`/services/${id}/parts`, {
    partId,
    quantity,
  });
  return response.data;
};

const removePartFromService = async (id, partItemId) => {
  const response = await axiosClient.delete(`/services/${id}/parts/${partItemId}`);
  return response.data;
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  getServiceParts,
  addPartToService,
  removePartFromService,
};