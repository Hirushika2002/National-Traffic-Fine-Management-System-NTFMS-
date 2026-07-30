const express = require('express');
const fineController = require('../controllers/fineController');
const { lookupRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/lookup', lookupRateLimiter, fineController.lookup);
router.get('/driver/:licenseNo', fineController.getByDriverLicense);
router.post('/mock', fineController.mockCreate);

module.exports = router;
