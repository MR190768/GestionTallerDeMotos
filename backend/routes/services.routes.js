
const express = require('express');
const router = express.Router();

const servicesController = require('../controllers/services.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Solo usuarios autenticados con rol admin o mecanico
router.use(authMiddleware,roleMiddleware(['admin', 'mecanico'])
);

// Listar órdenes de servicio
router.get('/', servicesController.getAllServices);

// Obtener detalle de una orden
router.get('/:id', servicesController.getServiceById);

// Crear una nueva orden
router.post('/', servicesController.createService);

// Editar una orden
router.put('/:id', servicesController.updateService);

// Cambiar únicamente el estado
router.patch('/:id/status', servicesController.updateServiceStatus);

module.exports = router;