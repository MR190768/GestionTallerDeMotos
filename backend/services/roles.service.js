const rolesRepository = require('../repositories/roles.repository');
const permissionsRepository = require('../repositories/permissions.repository');

const getAllRoles = async () => {
    return await rolesRepository.findAll();
};

const getRoleById = async (id) => {
    const role = await rolesRepository.findById(id);
    if (!role) {
        const error = new Error('Rol no encontrado');
        error.status = 404;
        throw error;
    }
    const permissions = await rolesRepository.getRolePermissions(id);
    return {
        ...role,
        permissions
    };
};

const getAllPermissions = async () => {
    return await permissionsRepository.findAll();
};

const createRole = async ({ name, description, permissionIds }) => {
    if (!name || !name.trim()) {
        const error = new Error('El nombre del rol es obligatorio');
        error.status = 400;
        throw error;
    }

    const trimmedName = name.trim();
    const existing = await rolesRepository.findByName(trimmedName);
    if (existing) {
        const error = new Error('Ya existe un rol con ese nombre');
        error.status = 400;
        throw error;
    }

    const roleId = await rolesRepository.create(trimmedName, description ? description.trim() : null);

    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
        await rolesRepository.assignPermissions(roleId, permissionIds);
    }

    return await getRoleById(roleId);
};

const updateRole = async (id, { name, description, permissionIds }) => {
    const role = await rolesRepository.findById(id);
    if (!role) {
        const error = new Error('Rol no encontrado');
        error.status = 404;
        throw error;
    }

    if (!name || !name.trim()) {
        const error = new Error('El nombre del rol es obligatorio');
        error.status = 400;
        throw error;
    }

    const trimmedName = name.trim();
    if (trimmedName.toLowerCase() !== role.name.toLowerCase()) {
        const existing = await rolesRepository.findByName(trimmedName);
        if (existing && existing.id !== Number(id)) {
            const error = new Error('Ya existe otro rol con ese nombre');
            error.status = 400;
            throw error;
        }
    }

    // Proteger el rol de Administrador para que no pierda permisos esenciales
    let finalPermissionIds = permissionIds;
    if (Number(id) === 1 && Array.isArray(permissionIds)) {
        // Asegurar que conserve permisos administrativos
        const allPermissions = await permissionsRepository.findAll();
        finalPermissionIds = allPermissions.map(p => p.id);
    }

    await rolesRepository.update(id, trimmedName, description ? description.trim() : null);

    if (Array.isArray(finalPermissionIds)) {
        await rolesRepository.clearPermissions(id);
        if (finalPermissionIds.length > 0) {
            await rolesRepository.assignPermissions(id, finalPermissionIds);
        }
    }

    return await getRoleById(id);
};

const deleteRole = async (id) => {
    if (Number(id) === 1) {
        const error = new Error('No es posible eliminar el rol de Administrador principal');
        error.status = 400;
        throw error;
    }

    const role = await rolesRepository.findById(id);
    if (!role) {
        const error = new Error('Rol no encontrado');
        error.status = 404;
        throw error;
    }

    const usersCount = await rolesRepository.countUsersWithRole(id);
    if (usersCount > 0) {
        const error = new Error(`No se puede eliminar el rol porque tiene ${usersCount} usuario(s) asignado(s). Reasigna los usuarios primero.`);
        error.status = 400;
        throw error;
    }

    await rolesRepository.deleteRole(id);
    return { message: 'Rol eliminado exitosamente' };
};

module.exports = {
    getAllRoles,
    getRoleById,
    getAllPermissions,
    createRole,
    updateRole,
    deleteRole
};
