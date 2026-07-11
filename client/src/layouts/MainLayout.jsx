import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Outlet />
    </div>
  );
}

export default MainLayout;
