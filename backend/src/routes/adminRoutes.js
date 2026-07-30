const express = require('express');
const adminReportController = require('../controllers/adminReportController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/reports/summary', adminReportController.summary);
router.get('/reports/districts', adminReportController.districts);
router.get('/reports/categories', adminReportController.categories);
router.get('/fines', adminReportController.fineExplorer);

module.exports = router;
