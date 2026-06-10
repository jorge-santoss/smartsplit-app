const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const settlementController = require('../controllers/settlementController');
const router = Router();

router.use(authMiddleware);

router.post('/:householdId/settlements', settlementController.create);
router.get('/:householdId/settlements', settlementController.listByHousehold);
router.delete('/settlements/:id', settlementController.remove);

module.exports = router;