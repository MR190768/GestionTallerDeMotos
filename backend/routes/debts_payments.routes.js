const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');
const router = Router();

router.use(authMiddleware);
router.use(permissionMiddleware('manage_finances'));

module.exports = router;