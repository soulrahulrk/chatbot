require('dotenv').config();

const REQUIRED_VARS = ['MONGO_URI'];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[FATAL] Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
