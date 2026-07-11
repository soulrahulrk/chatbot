import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-primary-600">404</h1>
      <p className="text-slate-600">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-700"
      >
        Back to Chat
      </Link>
    </div>
  );
}

export default NotFoundPage;
