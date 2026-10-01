const { Router } = require('express');
const motorcyclesController = require('../controllers/motorcycles.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = Router();

// Todas las rutas requieren autenticación y permiso manage_motorcycles (o Administrador)
router.use(authMiddleware);
router.use(permissionMiddleware('manage_motorcycles'));

// Rutas específicas primero para evitar colisión con :id
router.get('/search-plate', motorcyclesController.searchByPlate);
router.get('/client/:clientId', motorcyclesController.getByClientId);

// CRUD de motocicletas
router.get('/', motorcyclesController.getAll);
router.get('/:id', motorcyclesController.getById);
router.post('/', motorcyclesController.create);
router.put('/:id', motorcyclesController.update);
router.delete('/:id', motorcyclesController.deleteMotorcycle);

module.exports = router;