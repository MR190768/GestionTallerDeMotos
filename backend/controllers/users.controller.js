const usersService = require('../services/users.service');

const getAll = async (req, res, next) => {
    try {
        const data = await usersService.getAll();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const { name, email, password, role_id } = req.body;
        const result = await usersService.createUser(name, email, password, role_id);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { name, email, role_id } = req.body;
        const result = await usersService.updateUser(req.params.id, name, email, role_id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await usersService.deleteUser(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    create,
    update,
    remove
};