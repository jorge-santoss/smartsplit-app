const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const balanceController = require('../controllers/balanceController');
const router = Router();

router.use(authMiddleware);

router.get('/balances/summary', balanceController.getSummary);
router.get('/households/:householdId/balances', balanceController.getBalances);

module.exports = router;