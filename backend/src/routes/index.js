const express = require('express');
const paymentRoutes = require('./paymentRoutes');

const router = express.Router();

router.use('/payments', paymentRoutes);

module.exports = router;
