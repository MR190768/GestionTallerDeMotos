const bcrypt = require('bcrypt');
const usersRepository = require('../repositories/users.repository');
const rolesRepository = require('../repositories/roles.repository');

const getAll = async () => {
    return await usersRepository.findAll();
};

const createUser = async (name, email, password, roleId) => {
    if (!name || !name.trim()) {
        const error = new Error('El nombre es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!email || !email.trim()) {
        const error = new Error('El correo electrónico es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!password || password.length < 6) {
        const error = new Error('La contraseña debe tener al menos 6 caracteres');
        error.status = 400;
        throw error;
    }

    const targetRoleId = Number(roleId) || 2; // Default a Mecánico si no se especifica
    const role = await rolesRepository.findById(targetRoleId);
    if (!role) {
        const error = new Error('El rol asignado no existe');
        error.status = 400;
        throw error;
    }

    const existingUser = await usersRepository.findByEmail(email.trim());
    if (existingUser) {
        const error = new Error('El correo ya está registrado en el sistema');
        error.status = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await usersRepository.createUser(
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        targetRoleId
    );

    return {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role_id: targetRoleId,
        role_name: role.name,
        message: 'Usuario creado exitosamente'
    };
};

const updateUser = async (id, name, email, roleId) => {
    const user = await usersRepository.findById(id);
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    if (!name || !name.trim()) {
        const error = new Error('El nombre es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!email || !email.trim()) {
        const error = new Error('El correo electrónico es obligatorio');
        error.status = 400;
        throw error;
    }

    const targetRoleId = Number(roleId) || user.role_id;
    const role = await rolesRepository.findById(targetRoleId);
    if (!role) {
        const error = new Error('El rol especificado no existe');
        error.status = 400;
        throw error;
    }

    const existingUser = await usersRepository.findByEmail(email.trim());
    if (existingUser && existingUser.id !== Number(id)) {
        const error = new Error('El correo ya está en uso por otro usuario');
        error.status = 400;
        throw error;
    }

    // Proteger para que el usuario ID 1 no pierda el rol de Administrador
    let finalRoleId = targetRoleId;
    if (Number(id) === 1) {
        finalRoleId = 1;
    }

    await usersRepository.updateUser(id, name.trim(), email.trim().toLowerCase(), finalRoleId);
    return {
        id: Number(id),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role_id: finalRoleId,
        role_name: role.name,
        message: 'Usuario actualizado exitosamente'
    };
};

const deleteUser = async (id) => {
    if (Number(id) === 1) {
        const error = new Error('No es posible eliminar el Administrador principal del sistema');
        error.status = 400;
        throw error;
    }

    const user = await usersRepository.findById(id);
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    await usersRepository.deleteUser(id);
    return { message: 'Usuario eliminado exitosamente' };
};

module.exports = {
    getAll,
    createUser,
    updateUser,
    deleteUser
};