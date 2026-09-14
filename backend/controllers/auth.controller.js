const authService = require('../services/auth.service');
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
const logout = async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        next(error);
    }
};
module.exports = { login, logout };