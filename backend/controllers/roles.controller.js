const rolesService = require('../services/roles.service');

const getAllRoles = async (req, res, next) => {
    try {
        const roles = await rolesService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        next(error);
    }
};

const getRoleById = async (req, res, next) => {
    try {
        const role = await rolesService.getRoleById(req.params.id);
        res.status(200).json(role);
    } catch (error) {
        next(error);
    }
};

const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await rolesService.getAllPermissions();
        res.status(200).json(permissions);
    } catch (error) {
        next(error);
    }
};

const createRole = async (req, res, next) => {
    try {
        const { name, description, permissionIds } = req.body;
        const newRole = await rolesService.createRole({ name, description, permissionIds });
        res.status(201).json(newRole);
    } catch (error) {
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const { name, description, permissionIds } = req.body;
        const updated = await rolesService.updateRole(req.params.id, { name, description, permissionIds });
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

const deleteRole = async (req, res, next) => {
    try {
        const result = await rolesService.deleteRole(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    getAllPermissions,
    createRole,
    updateRole,
    deleteRole
};
