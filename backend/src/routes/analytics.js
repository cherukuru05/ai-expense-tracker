// routes/analytics.js
const express = require('express');
const { getOverview, getTrend, getWeekly, getAIInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.get('/overview', getOverview);
router.get('/trend', getTrend);
router.get('/weekly', getWeekly);
router.get('/ai-insights', getAIInsights);
module.exports = router;