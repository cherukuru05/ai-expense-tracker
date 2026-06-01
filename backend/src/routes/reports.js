// routes/reports.js
const express = require('express');
const { getMonthlyReport, downloadPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/monthly', getMonthlyReport);
router.get('/monthly/pdf', downloadPDF);
module.exports = router;