import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthRouter from '../../screens/auth/AuthRouter';

export default function AuthRouterWrapper({ initialMode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const onEnterApp = (mode) => {
    if (mode === 'helper') navigate('/helper/home');
    else navigate('/customer/home');
  };

  // If already authenticated, redirect to customer or helper home
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'helper' ? '/helper/home' : '/customer/home'} replace />;
  }

  const mode = initialMode || searchParams.get('mode') || (searchParams.get('role') === 'helper' ? 'signup' : 'login');
  const role = searchParams.get('role') || 'customer';

  return (
    <AuthRouter
      initialScreen={mode === 'signup' ? 'signup' : 'login'}
      initialRole={role}
      onEnterApp={onEnterApp}
      onNavigateHome={() => navigate('/')}
    />
  );
}
