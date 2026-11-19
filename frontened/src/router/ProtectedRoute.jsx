import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ fallback = '/auth' }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--hj-paper, #F8F9FA)' }}>
        <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: '#F4831F' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--hj-ink-soft, #64748B)', fontFamily: 'DM Sans, sans-serif' }}>
          Loading your session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
