const { Router } = require('express');
const clientsController = require('../controllers/clients.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const router = Router();

router.use(authMiddleware);

//Usuarios admin o mecanicos requeridos para observar y agregar clientes
router.use(roleMiddleware(['admin', 'mecanico']));

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