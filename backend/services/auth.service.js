const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const loginUser = async (email, password) => {
    const user = await authRepository.findByEmail(email);
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
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return { token, user: payload };
};
module.exports = { loginUser };