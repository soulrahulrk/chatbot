const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const { initSocket } = require('./socket');
const registerSocketHandlers = require('./socket/socketHandlers');
const logger = require('./utils/logger');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocket(io);
registerSocketHandlers(io);

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      logger.success(`Server running on port ${PORT} [${NODE_ENV}]`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});
