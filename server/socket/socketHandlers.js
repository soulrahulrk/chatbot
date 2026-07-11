const logger = require('../utils/logger');
const messageService = require('../services/message.service');

/**
 * Registers all Socket.io event handlers. This is the primary send path for
 * the chat UI: the client emits "send_message", the server persists it via
 * the shared message service, then broadcasts "receive_message" to everyone
 * (including the sender) so the message list has a single source of truth.
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('send_message', async (payload, callback) => {
      const ack = typeof callback === 'function' ? callback : () => {};

      try {
        const savedMessage = await messageService.createMessage(payload);
        io.emit('receive_message', savedMessage);
        ack({ success: true, data: savedMessage });
      } catch (error) {
        logger.error(`send_message rejected for ${socket.id}: ${error.message}`);
        ack({ success: false, error: error.message || 'Failed to send message.' });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = registerSocketHandlers;
