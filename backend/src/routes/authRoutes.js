// const { Router } = require('express');
// const router = Router();

// router.post('/register', (req, res) => {
//     res.json({message: 'Register endpoint - coming soon'});

// });

// router.post('/login', (req, res) =>{
//     res.json({message: ' Login endpoint - coming soon'})
// });

// module.exports = router;



const { Router } = require('express');
const {validateRegister, validateLogin } = require('../validators/authValidators');
const authController = require('../controllers/authController');
const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login); 

module.exports = router;