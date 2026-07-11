import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from './useSocket.js';

const STOP_TYPING_DELAY = 1500;
// Safety net in case a client disconnects mid-keystroke and its explicit
// "stopped typing" event never arrives.
const REMOTE_TYPING_TIMEOUT = 4000;

/**
 * Emits "typing" events for the local user (debounced back to false after a
 * pause) and tracks which other usernames are currently typing.
 */
function useTypingIndicator(username) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]);
  const stopTimerRef = useRef(null);
  const remoteTimersRef = useRef({});

  useEffect(() => {
    const handleUserTyping = ({ username: who, isTyping } = {}) => {
      if (!who || who === username) return;

      setTypingUsers((prev) => {
        const withoutUser = prev.filter((u) => u !== who);
        return isTyping ? [...withoutUser, who] : withoutUser;
      });

      clearTimeout(remoteTimersRef.current[who]);
      if (isTyping) {
        remoteTimersRef.current[who] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== who));
        }, REMOTE_TYPING_TIMEOUT);
      }
    };

    socket.on('user_typing', handleUserTyping);
    return () => socket.off('user_typing', handleUserTyping);
  }, [socket, username]);

  const notifyTyping = useCallback(() => {
    socket.emit('typing', { username, isTyping: true });
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      socket.emit('typing', { username, isTyping: false });
    }, STOP_TYPING_DELAY);
  }, [socket, username]);

  const notifyStoppedTyping = useCallback(() => {
    clearTimeout(stopTimerRef.current);
    socket.emit('typing', { username, isTyping: false });
  }, [socket, username]);

  useEffect(
    () => () => {
      clearTimeout(stopTimerRef.current);
      Object.values(remoteTimersRef.current).forEach(clearTimeout);
    },
    []
  );

  return { typingUsers, notifyTyping, notifyStoppedTyping };
}

export default useTypingIndicator;
