// In-memory presence tracking: socket.id -> username. Intentionally not
// persisted — presence is only meaningful for currently-open connections,
// and resets cleanly on server restart (see README "Design Decisions").
const socketUsernames = new Map();

function setUsername(socketId, username) {
  socketUsernames.set(socketId, username);
}

function removeSocket(socketId) {
  const username = socketUsernames.get(socketId);
  socketUsernames.delete(socketId);
  return username;
}

function getOnlineUsernames() {
  return Array.from(new Set(socketUsernames.values()));
}

module.exports = { setUsername, removeSocket, getOnlineUsernames };
