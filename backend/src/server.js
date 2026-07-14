const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startBillReminders } = require('./services/reminderService');

const PORT = process.env.PORT || 3001;

// Connect to DB for serverless environment
connectDB().catch((err) => logger.error('MongoDB connection error:', err));

// Start cron jobs (runs only when function is active on Vercel)
try {
  startBillReminders();
} catch(e) {}

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`FinTrack AI server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

module.exports = app;