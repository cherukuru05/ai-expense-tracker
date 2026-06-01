const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startBillReminders } = require('./services/reminderService');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`FinTrack AI server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Start cron jobs for bill reminders
  startBillReminders();
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});