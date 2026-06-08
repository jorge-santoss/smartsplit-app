const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');
const router = Router();

router.use(authMiddleware);

router.get('/feed', activityController.getFeed);

module.exports = router;
