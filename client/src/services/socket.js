import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Lazily creates a single shared socket instance. autoConnect is disabled so
 * SocketContext controls the connection lifecycle explicitly (connect on
 * mount, disconnect on unmount) instead of connecting the moment this module
 * is imported.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export default getSocket;
