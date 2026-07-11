const logger = require('../utils/logger');
const messageService = require('../services/message.service');
const presence = require('./presence');

/**
 * Registers all Socket.io event handlers. This is the primary send path for
 * the chat UI: the client emits "send_message", the server persists it via
 * the shared message service, then broadcasts "receive_message" to everyone
 * (including the sender) so the message list has a single source of truth.
 *
 * Also handles presence ("join"/disconnect -> "online_users"), typing
 * indicators, and delivered/read receipts. These are relayed between
 * clients only — none of it is persisted to MongoDB, since it only ever
 * describes the state of currently-open connections.
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join', ({ username } = {}) => {
      if (typeof username !== 'string' || !username.trim()) return;
      presence.setUsername(socket.id, username.trim());
      io.emit('online_users', presence.getOnlineUsernames());
    });

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

    socket.on('typing', ({ username, isTyping } = {}) => {
      if (typeof username !== 'string' || !username.trim()) return;
      socket.broadcast.emit('user_typing', { username: username.trim(), isTyping: Boolean(isTyping) });
    });

    socket.on('message_delivered', ({ messageId } = {}) => {
      if (!messageId) return;
      socket.broadcast.emit('delivered_receipt', { messageId });
    });

    socket.on('message_read', ({ messageId } = {}) => {
      if (!messageId) return;
      socket.broadcast.emit('read_receipt', { messageId });
    });

    socket.on('disconnect', (reason) => {
      const username = presence.removeSocket(socket.id);
      io.emit('online_users', presence.getOnlineUsernames());
      if (username) {
        // Clear any "is typing" state this socket left behind.
        socket.broadcast.emit('user_typing', { username, isTyping: false });
      }
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = registerSocketHandlers;
