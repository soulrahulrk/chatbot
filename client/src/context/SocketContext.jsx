import { createContext, useEffect, useMemo, useState } from 'react';
import { getSocket } from '../services/socket.js';

export const SocketContext = createContext(null);

/**
 * Owns the Socket.io connection lifecycle and exposes connection state to
 * the rest of the tree. Handles automatic reconnection feedback so any
 * component can show a "Reconnecting..." indicator without its own listeners.
 */
export function SocketProvider({ children }) {
  const socket = useMemo(() => getSocket(), []);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = () => {
      setIsConnected(false);
      setConnectionError('Unable to reach the chat server. Retrying...');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo(
    () => ({ socket, isConnected, connectionError }),
    [socket, isConnected, connectionError]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export default SocketContext;
