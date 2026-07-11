const Message = require('../models/message.model');
const validateMessagePayload = require('../utils/validateMessagePayload');

/**
 * Returns the full chat history, oldest first, so the client can render it
 * top-to-bottom on load/refresh without re-sorting.
 */
async function getAllMessages() {
  return Message.find().sort({ createdAt: 1 }).lean();
}

/**
 * Validates and persists a message. Called from both the REST controller and
 * the Socket.io "send_message" handler so every entry point shares identical
 * validation and persistence behavior.
 */
async function createMessage(payload) {
  const { username, message } = validateMessagePayload(payload);
  const created = await Message.create({ username, message });
  return created.toObject();
}

module.exports = { getAllMessages, createMessage };
