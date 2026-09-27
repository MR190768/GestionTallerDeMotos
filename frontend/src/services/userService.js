import axiosClient from '../api/axiosClient';

const getAllUsers = async () => {
    const response = await axiosClient.get('/users');
    return response.data;
};

const createUser = async (userData) => {
    const response = await axiosClient.post('/users', userData);
    return response.data;
};

const updateUser = async (id, userData) => {
    const response = await axiosClient.put(`/users/${id}`, userData);
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
};

export {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
