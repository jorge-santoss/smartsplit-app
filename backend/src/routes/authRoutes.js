const { Router } = require('express');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const authController = require('../controllers/authController');
const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

module.exports = router;
