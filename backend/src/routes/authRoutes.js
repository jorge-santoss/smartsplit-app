const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const authController = require('../controllers/authController');
const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/password', authMiddleware, authController.changePassword);
router.delete('/profile', authMiddleware, authController.deleteAccount);

module.exports = router;