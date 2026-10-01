const motorcyclesRepository = require('../repositories/motorcycles.repository');
const clientsRepository = require('../repositories/clients.repository');

const getAll = async (filters = {}) => {
    return await motorcyclesRepository.findAll(filters);
};

const getById = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
        const error = new Error('Identificador de motocicleta inválido');
        error.status = 400;
        throw error;
    }

    const motorcycle = await motorcyclesRepository.findById(numericId);
    if (!motorcycle) {
        const error = new Error('Motocicleta no encontrada');
        error.status = 404;
        throw error;
    }

    // Cargar historial de órdenes de servicio asociadas
    const servicesHistory = await motorcyclesRepository.getServiceHistory(numericId);
    motorcycle.servicesHistory = servicesHistory || [];

    return motorcycle;
};

const searchByPlate = async (plate) => {
    if (!plate || !plate.trim()) {
        const error = new Error('Debe proporcionar una placa para realizar la búsqueda');
        error.status = 400;
        throw error;
    }

    return await motorcyclesRepository.findByPlate(plate.trim());
};

const getByClientId = async (clientId) => {
    const numericClientId = parseInt(clientId, 10);
    if (isNaN(numericClientId) || numericClientId <= 0) {
        const error = new Error('Identificador de cliente inválido');
        error.status = 400;
        throw error;
    }

    const client = await clientsRepository.getById(numericClientId);
    if (!client) {
        const error = new Error('El cliente especificado no existe');
        error.status = 404;
        throw error;
    }

    return await motorcyclesRepository.findByClientId(numericClientId);
};

const create = async ({ clientId, brand, model, year, licensePlate }) => {
    // Validaciones de obligatoriedad
    if (!clientId) {
        const error = new Error('El cliente propietario es obligatorio');
        error.status = 400;
        throw error;
    }

    const numericClientId = parseInt(clientId, 10);
    if (isNaN(numericClientId) || numericClientId <= 0) {
        const error = new Error('El ID de cliente debe ser un número válido');
        error.status = 400;
        throw error;
    }

    const client = await clientsRepository.getById(numericClientId);
    if (!client) {
        const error = new Error('El cliente asociado no existe en el sistema');
        error.status = 404;
        throw error;
    }

    if (!brand || !brand.trim()) {
        const error = new Error('La marca de la motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    if (!model || !model.trim()) {
        const error = new Error('El modelo de la motocicleta es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!licensePlate || !licensePlate.trim()) {
        const error = new Error('La placa de la motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    const cleanPlate = licensePlate.trim().toUpperCase();

    // Validar año si se envía
    let cleanYear = null;
    if (year !== undefined && year !== null && String(year).trim() !== '') {
        cleanYear = parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(cleanYear) || cleanYear < 1950 || cleanYear > currentYear + 1) {
            const error = new Error(`El año de fabricación debe estar entre 1950 y ${currentYear + 1}`);
            error.status = 400;
            throw error;
        }
    }

    // Validar unicidad de placa
    const plateExists = await motorcyclesRepository.existsByPlate(cleanPlate);
    if (plateExists) {
        const error = new Error(`Ya existe una motocicleta registrada con la placa ${cleanPlate}`);
        error.status = 409;
        throw error;
    }

    const newId = await motorcyclesRepository.create({
        clientId: numericClientId,
        brand: brand.trim(),
        model: model.trim(),
        year: cleanYear,
        licensePlate: cleanPlate
    });

    return await getById(newId);
};

const update = async (id, { clientId, brand, model, year, licensePlate }) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
        const error = new Error('Identificador de motocicleta inválido');
        error.status = 400;
        throw error;
    }

    const existing = await motorcyclesRepository.findById(numericId);
    if (!existing) {
        const error = new Error('Motocicleta no encontrada');
        error.status = 404;
        throw error;
    }

    if (!clientId) {
        const error = new Error('El cliente propietario es obligatorio');
        error.status = 400;
        throw error;
    }

    const numericClientId = parseInt(clientId, 10);
    const client = await clientsRepository.getById(numericClientId);
    if (!client) {
        const error = new Error('El cliente asociado no existe en el sistema');
        error.status = 404;
        throw error;
    }

    if (!brand || !brand.trim()) {
        const error = new Error('La marca de la motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    if (!model || !model.trim()) {
        const error = new Error('El modelo de la motocicleta es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!licensePlate || !licensePlate.trim()) {
        const error = new Error('La placa de la motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    const cleanPlate = licensePlate.trim().toUpperCase();

    // Validar año
    let cleanYear = null;
    if (year !== undefined && year !== null && String(year).trim() !== '') {
        cleanYear = parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(cleanYear) || cleanYear < 1950 || cleanYear > currentYear + 1) {
            const error = new Error(`El año de fabricación debe estar entre 1950 y ${currentYear + 1}`);
            error.status = 400;
            throw error;
        }
    }

    // Validar si la placa ya la tiene otra moto
    const plateExists = await motorcyclesRepository.existsByPlate(cleanPlate, numericId);
    if (plateExists) {
        const error = new Error(`Ya existe otra motocicleta registrada con la placa ${cleanPlate}`);
        error.status = 409;
        throw error;
    }

    await motorcyclesRepository.update(numericId, {
        clientId: numericClientId,
        brand: brand.trim(),
        model: model.trim(),
        year: cleanYear,
        licensePlate: cleanPlate
    });

    return await getById(numericId);
};

const deleteMotorcycle = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
        const error = new Error('Identificador de motocicleta inválido');
        error.status = 400;
        throw error;
    }

    const existing = await motorcyclesRepository.findById(numericId);
    if (!existing) {
        const error = new Error('Motocicleta no encontrada');
        error.status = 404;
        throw error;
    }

    return await motorcyclesRepository.deleteById(numericId);
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