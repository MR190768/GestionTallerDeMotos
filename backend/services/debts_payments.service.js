const debtsPaymentsRepository = require('../repositories/debts_payments.repository');

const VALID_PAYMENT_METHODS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

const getFinancialSummary = async () => {
    return await debtsPaymentsRepository.getFinancialSummary();
};

const getServicesPaymentStatus = async ({ search, paymentStatus }) => {
    let normalizedStatus = null;
    if (paymentStatus && typeof paymentStatus === 'string') {
        normalizedStatus = paymentStatus.trim().toUpperCase();
        if (normalizedStatus !== 'ALL' && !['PENDING', 'PARTIAL', 'PAID'].includes(normalizedStatus)) {
            const error = new Error("Estado de pago no válido. Opciones: 'ALL', 'PENDING', 'PARTIAL', 'PAID'");
            error.status = 400;
            throw error;
        }
        if (normalizedStatus === 'ALL') {
            normalizedStatus = null;
        }
    }

    return await debtsPaymentsRepository.getServicesPaymentStatus({
        search: search || '',
        paymentStatus: normalizedStatus
    });
};

const getServiceFinanceDetail = async (serviceId) => {
    const id = parseInt(serviceId, 10);
    if (isNaN(id) || id <= 0) {
        const error = new Error('ID de servicio inválido');
        error.status = 400;
        throw error;
    }

    const detail = await debtsPaymentsRepository.getServiceFinanceDetail(id);
    if (!detail) {
        const error = new Error('Orden de servicio no encontrada');
        error.status = 404;
        throw error;
    }

    return detail;
};

const getTransactions = async ({ search }) => {
    return await debtsPaymentsRepository.getTransactions({ search: search || '' });
};

const createPayment = async ({ serviceId, amount, paymentMethod, notes }) => {
    const id = parseInt(serviceId, 10);
    if (isNaN(id) || id <= 0) {
        const error = new Error('ID de servicio inválido');
        error.status = 400;
        throw error;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
        const error = new Error('El monto a abonar debe ser un valor numérico mayor a 0');
        error.status = 400;
        throw error;
    }

    let method = 'EFECTIVO';
    if (paymentMethod && typeof paymentMethod === 'string') {
        const m = paymentMethod.trim().toUpperCase();
        if (!VALID_PAYMENT_METHODS.includes(m)) {
            const error = new Error(`Método de pago no válido. Opciones: ${VALID_PAYMENT_METHODS.join(', ')}`);
            error.status = 400;
            throw error;
        }
        method = m;
    }

    await debtsPaymentsRepository.createPayment({
        serviceId: id,
        amount: amountNum,
        paymentMethod: method,
        notes: notes ? String(notes).trim() : null
    });

    return await debtsPaymentsRepository.getServiceFinanceDetail(id);
};

module.exports = {
    getFinancialSummary,
    getServicesPaymentStatus,
    getServiceFinanceDetail,
    getTransactions,
    createPayment
};