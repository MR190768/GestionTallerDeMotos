const clientsRepository = require('../repositories/clients.repository');

/* --- Validaciones --- */

/* --- Correo --- */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/* --- Numero de Telefono --- */

/* --- Teléfono --- */
const isValidPhone = (phone) => {
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(phone);
};

/* --- Apartado del cliente --- */

const getAllClients = async () => {
    return await clientsRepository.getAll();
};

const getClientById = async (id) => {
    const client = await clientsRepository.getById(id);

    if (!client) {
        const error = new Error('Cliente no encontrado');
        error.status = 404;
        throw error;
    }

    return client;
};

const searchClients = async (query) => {
    if (!query || !query.trim()) {
        const error = new Error('El término de búsqueda es obligatorio');
        error.status = 400;
        throw error;
    }

    return await clientsRepository.search(query.trim());
};

const createClient = async (name, email, phone, address) => {
    if (!name || !name.trim()) {
        const error = new Error('El nombre es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!phone || !phone.trim()) {
        const error = new Error('El teléfono es obligatorio');
        error.status = 400;
        throw error;
    }

    if (email) {
        email = email.trim();

        if (!isValidEmail(email)) {
            const error = new Error('El correo electrónico no es válido');
            error.status = 400;
            throw error;
        }
    }

    if (!isValidPhone(phone.trim())) {
        const error = new Error('El número de teléfono no es válido');
        error.status = 400;
        throw error;
    }

    const id = await clientsRepository.create( name.trim(), email ? email.trim() : null, phone ? phone.trim() : null, address ? address.trim() : null);

    return await clientsRepository.getById(id);
};

const updateClient = async (id, name, email, phone, address) => {
    await getClientById(id);

    if (!name || !name.trim()) {
        const error = new Error('El nombre es obligatorio');
        error.status = 400;
        throw error;
    }

    if (!phone || !phone.trim()) {
        const error = new Error('El teléfono es obligatorio');
        error.status = 400;
        throw error;
    }

    if (email) {
        email = email.trim();

        if (!isValidEmail(email)) {
            const error = new Error('El correo electrónico no es válido');
            error.status = 400;
            throw error;
        }
    }

    if (!isValidPhone(phone.trim())) {
        const error = new Error('El número de teléfono no es válido');
        error.status = 400;
        throw error;
    }

    await clientsRepository.update(id, name.trim(), email ? email.trim() : null, phone ? phone.trim() : null, address ? address.trim() : null
    );

    return await clientsRepository.getById(id);
};

const deleteClient = async (id) => {
    await getClientById(id);

    await clientsRepository.remove(id);
};

module.exports = {
    getAllClients,
    getClientById,
    searchClients,
    createClient,
    updateClient,
    deleteClient
};