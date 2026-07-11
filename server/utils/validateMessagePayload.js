const ApiError = require('./ApiError');

const MAX_USERNAME_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Single source of truth for message validation — used by both the REST
 * controller and the Socket.io handler so the two entry points can never
 * drift apart in what they accept.
 */
function validateMessagePayload(payload) {
  const username = typeof payload?.username === 'string' ? payload.username.trim() : '';
  const message = typeof payload?.message === 'string' ? payload.message.trim() : '';

  if (!username) {
    throw new ApiError(400, 'Username is required.');
  }
  if (username.length > MAX_USERNAME_LENGTH) {
    throw new ApiError(400, `Username must be ${MAX_USERNAME_LENGTH} characters or fewer.`);
  }
  if (!message) {
    throw new ApiError(400, 'Message cannot be empty.');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }

  return { username, message };
}

module.exports = validateMessagePayload;
