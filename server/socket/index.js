let ioInstance = null;

/** Called once from server.js right after the Socket.io server is created. */
function initSocket(io) {
  ioInstance = io;
}

/** Lets controllers broadcast to every connected client without a circular import. */
function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return ioInstance;
}

module.exports = { initSocket, getIO };
