const express = require('express');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
