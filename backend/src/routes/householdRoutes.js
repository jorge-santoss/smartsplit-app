const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const householdController = require('../controllers/householdController');
const router = Router();

router.use(authMiddleware);

router.post('/', householdController.create);
router.get('/', householdController.list);
router.get('/:id', householdController.getById);
router.post('/:id/members', householdController.addMember);
router.put('/:id', householdController.update);
router.delete('/:id', householdController.remove);

module.exports = router;