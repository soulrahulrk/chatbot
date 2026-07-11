import useSocket from '../hooks/useSocket.js';
import logo from '../assets/logo.svg';

function Header({ username, onChangeUsername }) {
  const { isConnected } = useSocket();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Realtime Chat logo" className="h-9 w-9 rounded-xl" />
        <div>
          <h1 className="text-base font-semibold text-slate-800 sm:text-lg">Realtime Chat</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
            />
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {username && (
        <button
          type="button"
          onClick={onChangeUsername}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {username}
        </button>
      )}
    </header>
  );
}

export default Header;
