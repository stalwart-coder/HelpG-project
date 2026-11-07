import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Loader2 } from 'lucide-react';

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs font-mono">Verifying administrative security clearance...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
