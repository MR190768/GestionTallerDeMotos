const { Router } = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const clientsRoutes = require('./clients.routes');
const motorcyclesRoutes = require('./motorcycles.routes');
const servicesRoutes = require('./services.routes');
const partsRoutes = require('./parts.routes');
const debtsPaymentsRoutes = require('./debts_payments.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/clients', clientsRoutes);
router.use('/motorcycles', motorcyclesRoutes);
router.use('/services', servicesRoutes);
router.use('/parts', partsRoutes);
router.use('/debts-payments', debtsPaymentsRoutes);

module.exports = router;