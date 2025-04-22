const express = require('express');
const { getMe, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', protect, getMe);
router.get('/:username', getUserProfile);

module.exports = router;