import axiosClient from '../api/axiosClient';

const getAllClients = async () => {
  const response = await axiosClient.get('/clients');
  return response.data;
};

const getClientById = async (id) => {
  const response = await axiosClient.get(`/clients/${id}`);
  return response.data;
};

const searchClients = async (query) => {
  const response = await axiosClient.get('/clients/search', {
    params: {
      query,
    },
  });

  return response.data;
};

const createClient = async (clientData) => {
  const response = await axiosClient.post('/clients', clientData);
  return response.data;
};

const updateClient = async (id, clientData) => {
  const response = await axiosClient.put(`/clients/${id}`, clientData);
  return response.data;
};

const deleteClient = async (id) => {
  await axiosClient.delete(`/clients/${id}`);
};

export {
  getAllClients,
  getClientById,
  searchClients,
  createClient,
  updateClient,
  deleteClient
};