const { Router } = require('express');
const clientsController = require('../controllers/clients.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');
const router = Router();

router.use(authMiddleware);

// Requiere permiso para gestionar clientes (RBAC)
router.use(permissionMiddleware('manage_clients'));

// Listar clientes
router.get('/', clientsController.getAllClients);

// Buscar clientes
router.get('/search', clientsController.searchClients);

// Obtener detalle de un cliente
router.get('/:id', clientsController.getClientById);

// Crear cliente
router.post('/', clientsController.createClient);

// Editar cliente
router.put('/:id', clientsController.updateClient);

// Eliminar cliente
router.delete('/:id', clientsController.deleteClient);

module.exports = router;