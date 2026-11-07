import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthRouter from '../../screens/auth/AuthRouter';

export default function AuthRouterWrapper() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const onEnterApp = (mode) => {
    if (mode === 'helper') navigate('/helper/home');
    else navigate('/customer/home');
  };

  // If already authenticated, redirect to customer or helper home
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'helper' ? '/helper/home' : '/customer/home'} replace />;
  }

  return <AuthRouter onEnterApp={onEnterApp} />;
}
