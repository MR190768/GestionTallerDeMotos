import axiosClient from '../api/axiosClient';

const getAllRoles = async () => {
    const response = await axiosClient.get('/roles');
    return response.data;
};

const getRoleById = async (id) => {
    const response = await axiosClient.get(`/roles/${id}`);
    return response.data;
};

const getAllPermissions = async () => {
    const response = await axiosClient.get('/roles/permissions/all');
    return response.data;
};

const createRole = async (roleData) => {
    const response = await axiosClient.post('/roles', roleData);
    return response.data;
};

const updateRole = async (id, roleData) => {
    const response = await axiosClient.put(`/roles/${id}`, roleData);
    return response.data;
};

const deleteRole = async (id) => {
    const response = await axiosClient.delete(`/roles/${id}`);
    return response.data;
};

export {
    getAllRoles,
    getRoleById,
    getAllPermissions,
    createRole,
    updateRole,
    deleteRole
};
