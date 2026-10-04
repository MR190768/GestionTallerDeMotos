const servicesRepository = require('../repositories/services.repository');

const getAllServices = async (status) => {
    const validStatuses = [ 'ACTIVE', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED' ];
        
    let normalizedStatus = null;

    if (status) {
        normalizedStatus = status.trim().toUpperCase();

        if (!validStatuses.includes(normalizedStatus)) {
            const error = new Error('Estado no válido');
            error.status = 400;
            throw error;
        }
    }

    return await servicesRepository.getAll(normalizedStatus);
};
const getServiceById = async (id) => {
    const service = await servicesRepository.getById(id);

    if (!service) {
        const error = new Error('Servicio no encontrado');
        error.status = 404;
        throw error;
    }

    return service;
};

const createService = async (motorcycleId, description, cost) => {
    if (!motorcycleId) {
        const error = new Error('La motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    if (!description || !description.trim()) {
        const error = new Error('La descripción es obligatoria');
        error.status = 400;
        throw error;
    }

    if (cost === undefined || cost === null || Number(cost) < 0) {
        const error = new Error('El costo debe ser un valor válido');
        error.status = 400;
        throw error;
    }

    const motorcycleExists =
        await servicesRepository.motorcycleExists(motorcycleId);

    if (!motorcycleExists) {
        const error = new Error('La motocicleta especificada no existe');
        error.status = 404;
        throw error;
    }

    const id = await servicesRepository.create(
        motorcycleId,
        description.trim(),
        cost
    );

    return await servicesRepository.getById(id);
};

const updateService = async (
    id,
    motorcycleId,
    description,
    cost
) => {
    await getServiceById(id);

    if (!motorcycleId) {
        const error = new Error('La motocicleta es obligatoria');
        error.status = 400;
        throw error;
    }

    if (!description || !description.trim()) {
        const error = new Error('La descripción es obligatoria');
        error.status = 400;
        throw error;
    }

    if (cost === undefined || cost === null || Number(cost) < 0) {
        const error = new Error('El costo debe ser un valor válido');
        error.status = 400;
        throw error;
    }

    const motorcycleExists =
        await servicesRepository.motorcycleExists(motorcycleId);

    if (!motorcycleExists) {
        const error = new Error('La motocicleta especificada no existe');
        error.status = 404;
        throw error;
    }

    await servicesRepository.update(
        id,
        motorcycleId,
        description.trim(),
        cost
    );

    return await servicesRepository.getById(id);
};

const updateServiceStatus = async (id, status) => {
    await getServiceById(id);

    const validStatuses = [
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ];

    if (!status || !status.trim()) {
        const error = new Error('El estado es obligatorio');
        error.status = 400;
        throw error;
    }

    const normalizedStatus = status.trim().toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
        const error = new Error('Estado no válido');
        error.status = 400;
        throw error;
    }

    await servicesRepository.updateStatus(
        id,
        normalizedStatus
    );

    return await servicesRepository.getById(id);
};

const getServiceParts = async (serviceId) => {
    await getServiceById(serviceId);
    return await servicesRepository.getPartsByServiceId(serviceId);
};

const addPartToService = async (serviceId, partId, quantity, userId) => {
    await getServiceById(serviceId);

    if (!partId) {
        const error = new Error('El repuesto es obligatorio');
        error.status = 400;
        throw error;
    }

    const cant = Number(quantity);
    if (!quantity || isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
        const error = new Error('La cantidad debe ser un número entero mayor a 0');
        error.status = 400;
        throw error;
    }

    await servicesRepository.addPartToService(serviceId, partId, cant, userId);

    return await servicesRepository.getById(serviceId);
};

const removePartFromService = async (serviceId, servicePartId, userId) => {
    await getServiceById(serviceId);

    if (!servicePartId) {
        const error = new Error('El ID de asignación del repuesto es obligatorio');
        error.status = 400;
        throw error;
    }

    await servicesRepository.removePartFromService(serviceId, servicePartId, userId);

    return await servicesRepository.getById(serviceId);
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