import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">S</div>
            <span className="text-xl font-bold text-slate-900">Skillbridge</span>
          </Link>
          <div className="card p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
