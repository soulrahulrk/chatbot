import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import MessageList from '../components/MessageList.jsx';
import ChatInput from '../components/ChatInput.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import UsernameModal from '../components/UsernameModal.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import useMessages from '../hooks/useMessages.js';
import useOnlineUsers from '../hooks/useOnlineUsers.js';
import useTypingIndicator from '../hooks/useTypingIndicator.js';
import useSocket from '../hooks/useSocket.js';
import { getStoredUsername, setStoredUsername } from '../utils/username.js';

function ChatPage() {
  const [username, setUsername] = useState(getStoredUsername());
  const { socket, isConnected } = useSocket();
  const { messages, isLoading, isSending, error, sendMessage, clearError, receiptStatus } = useMessages(username);
  const onlineUsers = useOnlineUsers();
  const { typingUsers, notifyTyping, notifyStoppedTyping } = useTypingIndicator(username);

  // Announce presence whenever we have a username and a live connection —
  // this re-fires after a reconnect so the server's online list stays correct.
  useEffect(() => {
    if (username && isConnected) {
      socket.emit('join', { username });
    }
  }, [username, isConnected, socket]);

  const handleJoin = (name) => {
    setStoredUsername(name);
    setUsername(name);
  };

  const handleSend = (text) => {
    sendMessage(text);
    notifyStoppedTyping();
  };

  if (!username) {
    return <UsernameModal onSubmit={handleJoin} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col bg-slate-50 shadow-sm sm:my-4 sm:rounded-2xl sm:border sm:border-slate-200">
      <Header username={username} onChangeUsername={() => setUsername('')} onlineUsers={onlineUsers} />
      <ErrorBanner message={error} onDismiss={clearError} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUsername={username}
        receiptStatus={receiptStatus}
      />
      <TypingIndicator typingUsers={typingUsers} />
      <ChatInput onSend={handleSend} onTyping={notifyTyping} disabled={isSending} />
    </div>
  );
}

export default ChatPage;
