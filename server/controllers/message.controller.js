const asyncHandler = require('../middlewares/asyncHandler');
const messageService = require('../services/message.service');
const ApiResponse = require('../utils/ApiResponse');
const { getIO } = require('../socket');

// GET /api/messages — full chat history, oldest first
const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getAllMessages();
  res.status(200).json(new ApiResponse(200, messages, 'Messages fetched successfully.'));
});

// POST /api/messages — persists a message and broadcasts it to every
// connected socket so clients created outside the socket flow (Postman,
// another service, this REST call itself) stay in sync with everyone else.
const createMessage = asyncHandler(async (req, res) => {
  const savedMessage = await messageService.createMessage(req.body);
  getIO().emit('new_message', savedMessage);
  res.status(201).json(new ApiResponse(201, savedMessage, 'Message sent successfully.'));
});

module.exports = { getMessages, createMessage };
