const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

module.exports = router;