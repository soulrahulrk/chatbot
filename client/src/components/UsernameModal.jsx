import { useState } from 'react';

function UsernameModal({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
        <h2 className="text-lg font-semibold text-slate-800">Welcome to Realtime Chat</h2>
        <p className="mt-1 text-sm text-slate-500">Choose a display name to join the conversation.</p>
        <input
          autoFocus
          type="text"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ankit"
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
}

export default UsernameModal;
