const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

const loginUser = async (email, password) => {
    if (!email || !password) {
        const error = new Error('Correo y contraseña requeridos');
        error.status = 400;
        throw error;
    }

    const user = await authRepository.findByEmail(email.trim());
    if (!user) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const permissions = await authRepository.getRolePermissions(user.role_id);

    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        role: user.role_name,
        permissions: permissions || []
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    return { token, user: payload };
};

module.exports = { loginUser };