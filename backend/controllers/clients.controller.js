const clientsService = require('../services/clients.service');

const getAllClients = async (req, res, next) => {
    try {
        const clients = await clientsService.getAllClients();

        res.json(clients);
    } catch (error) {
        next(error);
    }
};

const getClientById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const client = await clientsService.getClientById(id);

        res.json(client);
    } catch (error) {
        next(error);
    }
};

const searchClients = async (req, res, next) => {
    try {
        const { query } = req.query;

        const clients = await clientsService.searchClients(query);

        res.json(clients);
    } catch (error) {
        next(error);
    }
};

const createClient = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            address
        } = req.body;

        const client = await clientsService.createClient(
            name,
            email,
            phone,
            address
        );

        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
};

const updateClient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            address
        } = req.body;

        const client = await clientsService.updateClient(
            id,
            name,
            email,
            phone,
            address
        );

        res.json(client);
    } catch (error) {
        next(error);
    }
};

const deleteClient = async (req, res, next) => {
    try {
        const { id } = req.params;

        await clientsService.deleteClient(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllClients,
    getClientById,
    searchClients,
    createClient,
    updateClient,
    deleteClient
};