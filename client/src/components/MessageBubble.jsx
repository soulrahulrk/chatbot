import formatTimestamp from '../utils/formatTime.js';

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] flex-col gap-1 sm:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && <span className="px-1 text-xs font-medium text-slate-500">{message.username}</span>}
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isOwn
              ? 'rounded-br-sm bg-primary-600 text-white'
              : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
          }`}
        >
          {message.message}
        </div>
        <span className="px-1 text-[11px] text-slate-400">
          {formatTimestamp(message.timestamp || message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;
