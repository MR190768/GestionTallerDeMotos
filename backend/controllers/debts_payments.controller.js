const debtsPaymentsService = require('../services/debts_payments.service');

const getSummary = async (req, res, next) => {
    try {
        const summary = await debtsPaymentsService.getFinancialSummary();
        res.json(summary);
    } catch (error) {
        next(error);
    }
};

const getServicesPaymentStatus = async (req, res, next) => {
    try {
        const { search, paymentStatus } = req.query;
        const services = await debtsPaymentsService.getServicesPaymentStatus({
            search,
            paymentStatus
        });
        res.json(services);
    } catch (error) {
        next(error);
    }
};

const getServiceFinanceDetail = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const detail = await debtsPaymentsService.getServiceFinanceDetail(serviceId);
        res.json(detail);
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const { search } = req.query;
        const transactions = await debtsPaymentsService.getTransactions({ search });
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

const registerPayment = async (req, res, next) => {
    try {
        const { serviceId, amount, paymentMethod, notes } = req.body;
        const result = await debtsPaymentsService.createPayment({
            serviceId,
            amount,
            paymentMethod,
            notes
        });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getServicesPaymentStatus,
    getServiceFinanceDetail,
    getTransactions,
    registerPayment
};