const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.success('MongoDB connected.'));
mongoose.connection.on('error', (err) => logger.error(`MongoDB connection error: ${err.message}`));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected.'));

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
};

module.exports = connectDB;
