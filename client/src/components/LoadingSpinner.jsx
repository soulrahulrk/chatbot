function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
