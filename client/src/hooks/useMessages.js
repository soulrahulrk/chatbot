import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from './useSocket.js';
import { fetchMessages } from '../services/api.js';

/**
 * Owns chat state: loads history over REST on mount (so a refresh never
 * loses messages), then keeps it live via Socket.io. Both "receive_message"
 * (broadcast from the socket send flow) and "new_message" (broadcast from
 * the REST create flow) are handled identically and de-duplicated by _id,
 * since either path can be the one that actually created a given message.
 */
function useMessages() {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const knownIds = useRef(new Set());

  const addMessage = useCallback((incoming) => {
    if (!incoming || knownIds.current.has(incoming._id)) return;
    knownIds.current.add(incoming._id);
    setMessages((prev) => [...prev, incoming]);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const history = await fetchMessages();
        if (!isMounted) return;
        history.forEach((msg) => knownIds.current.add(msg._id));
        setMessages(history);
        setError(null);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    socket.on('receive_message', addMessage);
    socket.on('new_message', addMessage);

    return () => {
      socket.off('receive_message', addMessage);
      socket.off('new_message', addMessage);
    };
  }, [socket, addMessage]);

  const sendMessage = useCallback(
    (username, text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (!isConnected) {
        setError('You are offline. Reconnecting to the chat server...');
        return;
      }

      setIsSending(true);
      setError(null);

      socket.emit('send_message', { username, message: trimmed }, (response) => {
        setIsSending(false);
        if (!response?.success) {
          setError(response?.error || 'Failed to send message.');
        }
      });
    },
    [socket, isConnected]
  );

  const clearError = useCallback(() => setError(null), []);

  return { messages, isLoading, isSending, error, sendMessage, clearError };
}

export default useMessages;
