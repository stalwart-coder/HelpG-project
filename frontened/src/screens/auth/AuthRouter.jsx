import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import OtpVerification from './OtpVerification';
import ForgotPassword from './ForgotPassword';
import RoleSelection from './RoleSelection';

export default function AuthRouter({
  onEnterApp,
  onNavigateHome,
  initialScreen = 'login',
  initialRole = 'customer',
}) {
  const [screen, setScreen] = useState(initialScreen);
  const [currentRole, setCurrentRole] = useState(initialRole);
  const [otpFlow, setOtpFlow] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    if (initialRole) setCurrentRole(initialRole);
  }, [initialRole]);

  const navigate = (target, param) => {
    switch (target) {
      case 'login':
        setScreen('login');
        break;
      case 'signup':
        if (param === 'helper' || param === 'customer') {
          setCurrentRole(param);
        }
        setScreen('signup');
        break;
      case 'otp':
        setOtpFlow(param || 'login');
        setScreen('otp');
        break;
      case 'forgot-password':
        setScreen('forgot-password');
        break;
      case 'role-selection':
        setScreen('role-selection');
        break;
      case 'app':
        onEnterApp?.(param || currentRole || 'customer');
        break;
      case 'landing':
        if (onNavigateHome) {
          onNavigateHome();
        } else {
          window.location.href = '/';
        }
        break;
      default:
        break;
    }
  };

  switch (screen) {
    case 'login':
      return <Login onNavigate={navigate} />;
    case 'signup':
      return <Signup onNavigate={navigate} initialRole={currentRole} />;
    case 'otp':
      return <OtpVerification flow={otpFlow} onNavigate={navigate} />;
    case 'forgot-password':
      return <ForgotPassword onNavigate={navigate} />;
    case 'role-selection':
      return <RoleSelection onNavigate={navigate} />;
    default:
      return <Login onNavigate={navigate} />;
  }
}
