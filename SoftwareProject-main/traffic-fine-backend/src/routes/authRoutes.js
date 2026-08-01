const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/admin/login', authController.login);
router.post('/refresh', authController.refresh);

module.exports = router;
