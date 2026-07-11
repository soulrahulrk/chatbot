import { useState } from 'react';
import Header from '../components/Header.jsx';
import MessageList from '../components/MessageList.jsx';
import ChatInput from '../components/ChatInput.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import UsernameModal from '../components/UsernameModal.jsx';
import useMessages from '../hooks/useMessages.js';
import { getStoredUsername, setStoredUsername } from '../utils/username.js';

function ChatPage() {
  const [username, setUsername] = useState(getStoredUsername());
  const { messages, isLoading, isSending, error, sendMessage, clearError } = useMessages();

  const handleJoin = (name) => {
    setStoredUsername(name);
    setUsername(name);
  };

  const handleSend = (text) => {
    sendMessage(username, text);
  };

  if (!username) {
    return <UsernameModal onSubmit={handleJoin} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col bg-slate-50 shadow-sm sm:my-4 sm:rounded-2xl sm:border sm:border-slate-200">
      <Header username={username} onChangeUsername={() => setUsername('')} />
      <ErrorBanner message={error} onDismiss={clearError} />
      <MessageList messages={messages} isLoading={isLoading} currentUsername={username} />
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}

export default ChatPage;
