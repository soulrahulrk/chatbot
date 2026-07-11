import formatTimestamp from '../utils/formatTime.js';

// One check = sent, two gray checks = delivered, two blue checks = read.
function StatusTicks({ status }) {
  if (!status) return null;
  const showDouble = status === 'delivered' || status === 'read';
  const isRead = status === 'read';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-3.5 w-3.5 shrink-0 ${isRead ? 'text-sky-500' : 'text-slate-400'}`}
      aria-label={status}
    >
      <path d="M2 10.5 6 14l7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {showDouble && (
        <path
          d="M7 10.5 11 14l7-8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function MessageBubble({ message, isOwn, status }) {
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
        <span className="flex items-center gap-1 px-1 text-[11px] text-slate-400">
          {formatTimestamp(message.timestamp || message.createdAt)}
          {isOwn && <StatusTicks status={status} />}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;
