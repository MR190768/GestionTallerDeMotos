const { Router } = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const router = Router();

// Todas las rutas de usuarios requieren autenticación y rol de 'admin'
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', usersController.getAll);
router.post('/', usersController.create);
router.delete('/:id', usersController.remove);

module.exports = router;