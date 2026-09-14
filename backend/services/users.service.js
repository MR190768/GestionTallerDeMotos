const bcrypt = require('bcrypt');
const usersRepository = require('../repositories/users.repository');
const getAll = async () => {
    return await usersRepository.findAll();
};
const createUser = async (name, email, password, role) => {
    const existingUser = await usersRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error('El correo ya está registrado');
        error.status = 400;
        throw error;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = await usersRepository.createUser(name, email, hashedPassword, role || 'mecanico');
    return { id: userId, name, email, role: role || 'mecanico', message: 'Usuario creado exitosamente' };
};
const deleteUser = async (id) => {
    await usersRepository.deleteUser(id);
};
module.exports = { getAll, createUser, deleteUser };