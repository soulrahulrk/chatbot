import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

function MessageList({ messages, isLoading, currentUsername }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return <LoadingSpinner label="Loading chat history..." />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Say hello to get the conversation started!</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
      {messages.map((message) => (
        <MessageBubble key={message._id} message={message} isOwn={message.username === currentUsername} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
