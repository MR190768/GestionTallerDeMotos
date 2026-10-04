const { Router } = require('express');
const debtsPaymentsController = require('../controllers/debts_payments.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = Router();

// Protección estricta con RBAC (Token JWT válido y permiso 'manage_finances' o rol Administrador)
router.use(authMiddleware);
router.use(permissionMiddleware('manage_finances'));

// Resumen y KPIs globales
router.get('/summary', debtsPaymentsController.getSummary);

// Monitoreo de servicios con saldo y estado de cobro
router.get('/services', debtsPaymentsController.getServicesPaymentStatus);

// Detalle financiero y desglose de abonos de una orden específica
router.get('/services/:serviceId', debtsPaymentsController.getServiceFinanceDetail);

// Historial cronológico de transacciones
router.get('/transactions', debtsPaymentsController.getTransactions);

// Registrar pago o abono
router.post('/pay', debtsPaymentsController.registerPayment);

module.exports = router;