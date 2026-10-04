const servicesService = require('../services/services.service');

const getAllServices = async (req, res, next) => {
    try {
        const { status } = req.query;

        const services = await servicesService.getAllServices(status);

        res.json(services);
    } catch (error) {
        next(error);
    }
};

const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const service = await servicesService.getServiceById(id);

        res.json(service);
    } catch (error) {
        next(error);
    }
};

const createService = async (req, res, next) => {
    try {
        const {
            motorcycleId,
            description,
            cost
        } = req.body;

        const service = await servicesService.createService(
            motorcycleId,
            description,
            cost
        );

        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            motorcycleId,
            description,
            cost
        } = req.body;

        const service = await servicesService.updateService(
            id,
            motorcycleId,
            description,
            cost
        );

        res.json(service);
    } catch (error) {
        next(error);
    }
};

const updateServiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const service = await servicesService.updateServiceStatus(
            id,
            status
        );

        res.json(service);
    } catch (error) {
        next(error);
    }
};

const getServiceParts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const parts = await servicesService.getServiceParts(id);
        res.json(parts);
    } catch (error) {
        next(error);
    }
};

const addPartToService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { partId, quantity } = req.body;
        const userId = req.user ? req.user.id : null;

        const updatedService = await servicesService.addPartToService(
            id,
            partId,
            quantity,
            userId
        );

        res.status(201).json(updatedService);
    } catch (error) {
        next(error);
    }
};

const removePartFromService = async (req, res, next) => {
    try {
        const { id, partItemId } = req.params;
        const userId = req.user ? req.user.id : null;

        const updatedService = await servicesService.removePartFromService(
            id,
            partItemId,
            userId
        );

        res.json(updatedService);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    updateServiceStatus,
    getServiceParts,
    addPartToService,
    removePartFromService
};