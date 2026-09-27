const { Router } = require('express');
const rolesController = require('../controllers/roles.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = Router();

// Todas las rutas de roles requieren autenticación y permiso 'manage_roles' (o rol Administrador)
router.use(authMiddleware);
router.use(permissionMiddleware('manage_roles'));

// Listado de catálogo de permisos disponibles (antes de :id para evitar colisión de ruta)
router.get('/permissions/all', rolesController.getAllPermissions);

// Operaciones CRUD de Roles
router.get('/', rolesController.getAllRoles);
router.get('/:id', rolesController.getRoleById);
router.post('/', rolesController.createRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);

module.exports = router;
