const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast so Vercel doesn't hit 10s function timeout
    }).then(conn => {
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    });
  }

  try {
    await cachedPromise;
    return mongoose.connection;
  } catch (error) {
    cachedPromise = null; // Reset on failure
    logger.error('MongoDB connection error:', error.message);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Reconnecting...');
  cachedPromise = null;
});

module.exports = connectDB;