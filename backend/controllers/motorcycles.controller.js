const motorcyclesService = require('../services/motorcycles.service');

const getAll = async (req, res, next) => {
    try {
        const { search } = req.query;
        const motorcycles = await motorcyclesService.getAll({ search });
        res.json(motorcycles);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const motorcycle = await motorcyclesService.getById(id);
        res.json(motorcycle);
    } catch (error) {
        next(error);
    }
};

const searchByPlate = async (req, res, next) => {
    try {
        const plate = req.query.plate || req.query.query || '';
        const results = await motorcyclesService.searchByPlate(plate);
        res.json(results);
    } catch (error) {
        next(error);
    }
};

const getByClientId = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const motorcycles = await motorcyclesService.getByClientId(clientId);
        res.json(motorcycles);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const { clientId, brand, model, year, licensePlate } = req.body;
        const newMotorcycle = await motorcyclesService.create({
            clientId,
            brand,
            model,
            year,
            licensePlate
        });
        res.status(201).json(newMotorcycle);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { clientId, brand, model, year, licensePlate } = req.body;
        const updatedMotorcycle = await motorcyclesService.update(id, {
            clientId,
            brand,
            model,
            year,
            licensePlate
        });
        res.json(updatedMotorcycle);
    } catch (error) {
        next(error);
    }
};

const deleteMotorcycle = async (req, res, next) => {
    try {
        const { id } = req.params;
        await motorcyclesService.deleteMotorcycle(id);
        res.json({ message: 'Motocicleta eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    searchByPlate,
    getByClientId,
    create,
    update,
    deleteMotorcycle
};