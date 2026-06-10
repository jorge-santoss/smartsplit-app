const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const expenseController = require('../controllers/expenseController');
const router = Router();

router.use(authMiddleware);

router.post('/:householdId/expenses', expenseController.create);
router.get('/:householdId/expenses', expenseController.listByHousehold);
router.get('/expenses/:id', expenseController.getById);
router.put('/expenses/:id', expenseController.update);
router.delete('/expenses/:id', expenseController.remove);

module.exports = router;    