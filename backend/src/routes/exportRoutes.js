const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const exportController = require('../controllers/exportController');
const router = Router();

router.use(authMiddleware);

router.get('/:id/export/:format', exportController.exportData);

module.exports = router;