const express = require('express');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
