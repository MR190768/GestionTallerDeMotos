const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');

const router = Router();

// Todas las rutas de usuarios requieren autenticación y permiso 'manage_users' (o rol Administrador)
router.use(authMiddleware);
router.use(permissionMiddleware('manage_users'));

router.get('/', usersController.getAll);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;