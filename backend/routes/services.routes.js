const express = require('express');
const router = express.Router();

const servicesController = require('../controllers/services.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

// Solo usuarios autenticados con permiso para órdenes de servicio (RBAC)
router.use(authMiddleware, permissionMiddleware('manage_services'));

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

// Obtener partes asignadas a una orden
router.get('/:id/parts', servicesController.getServiceParts);

// Asignar parte a una orden
router.post('/:id/parts', servicesController.addPartToService);

// Quitar parte de una orden
router.delete('/:id/parts/:partItemId', servicesController.removePartFromService);

module.exports = router;