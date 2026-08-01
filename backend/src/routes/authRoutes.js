const express = require('express');
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
