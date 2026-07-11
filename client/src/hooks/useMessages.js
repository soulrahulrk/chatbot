import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from './useSocket.js';
import { fetchMessages } from '../services/api.js';

/**
 * Owns chat state: loads history over REST on mount (so a refresh never
 * loses messages), then keeps it live via Socket.io. Both "receive_message"
 * (broadcast from the socket send flow) and "new_message" (broadcast from
 * the REST create flow) are handled identically and de-duplicated by _id,
 * since either path can be the one that actually created a given message.
 *
 * Also tracks delivered/read receipts for messages authored by `username`.
 * Receipts are only requested for messages that arrive live over the
 * socket (not the initial history batch) — see README "Design Decisions"
 * for why the historical backlog is excluded from that flow.
 */
function useMessages(username) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [receiptStatus, setReceiptStatus] = useState({});
  const knownIds = useRef(new Set());
  const pendingReadRef = useRef(new Set());

  const markDelivered = useCallback((messageId) => socket.emit('message_delivered', { messageId }), [socket]);

  const markRead = useCallback(
    (messageId) => {
      socket.emit('message_read', { messageId });
      pendingReadRef.current.delete(messageId);
    },
    [socket]
  );

  const handleIncoming = useCallback(
    (incoming) => {
      if (!incoming || knownIds.current.has(incoming._id)) return;
      knownIds.current.add(incoming._id);
      setMessages((prev) => [...prev, incoming]);

      if (incoming.username !== username) {
        markDelivered(incoming._id);
        if (typeof document !== 'undefined' && document.hasFocus()) {
          markRead(incoming._id);
        } else {
          pendingReadRef.current.add(incoming._id);
        }
      }
    },
    [username, markDelivered, markRead]
  );

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
    socket.on('receive_message', handleIncoming);
    socket.on('new_message', handleIncoming);

    return () => {
      socket.off('receive_message', handleIncoming);
      socket.off('new_message', handleIncoming);
    };
  }, [socket, handleIncoming]);

  useEffect(() => {
    const handleDelivered = ({ messageId } = {}) => {
      if (!messageId) return;
      setReceiptStatus((prev) => (prev[messageId] === 'read' ? prev : { ...prev, [messageId]: 'delivered' }));
    };
    const handleRead = ({ messageId } = {}) => {
      if (!messageId) return;
      setReceiptStatus((prev) => ({ ...prev, [messageId]: 'read' }));
    };

    socket.on('delivered_receipt', handleDelivered);
    socket.on('read_receipt', handleRead);

    return () => {
      socket.off('delivered_receipt', handleDelivered);
      socket.off('read_receipt', handleRead);
    };
  }, [socket]);

  // If messages arrived while this tab was unfocused, mark them read once it regains focus.
  useEffect(() => {
    const handleFocus = () => {
      pendingReadRef.current.forEach((id) => markRead(id));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [markRead]);

  const sendMessage = useCallback(
    (text) => {
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
          return;
        }
        setReceiptStatus((prev) => ({ ...prev, [response.data._id]: prev[response.data._id] || 'sent' }));
      });
    },
    [socket, isConnected, username]
  );

  const clearError = useCallback(() => setError(null), []);

  return { messages, isLoading, isSending, error, sendMessage, clearError, receiptStatus };
}

export default useMessages;
