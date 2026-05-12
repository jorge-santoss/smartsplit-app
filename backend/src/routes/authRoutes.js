const { Router } = require('express');
const router = Router();

router.post('/register', (req, res) => {
    res.json({message: 'Register endpoint - coming soon'});

});

router.post('/login', (req, res) =>{
    res.json({message: ' Login endpoint - coming soon'})
});

module.exports = router;