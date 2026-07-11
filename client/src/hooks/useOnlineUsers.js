import { useEffect, useState } from 'react';
import useSocket from './useSocket.js';

/** Tracks the list of usernames currently connected, driven by the server's "online_users" broadcast. */
function useOnlineUsers() {
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const handleOnlineUsers = (users) => setOnlineUsers(Array.isArray(users) ? users : []);
    socket.on('online_users', handleOnlineUsers);
    return () => socket.off('online_users', handleOnlineUsers);
  }, [socket]);

  return onlineUsers;
}

export default useOnlineUsers;
