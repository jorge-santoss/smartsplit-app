const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
const router = Router();

router.use(authMiddleware);

router.get('/:householdId/categories', categoryController.listByHousehold);
router.post('/:householdId/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

module.exports = router;