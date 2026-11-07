import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import OtpVerification from './OtpVerification';
import ForgotPassword from './ForgotPassword';
import RoleSelection from './RoleSelection';

export default function AuthRouter({ onEnterApp }) {
  // screen: login | signup | otp | forgot-password | role-selection
  const [screen, setScreen] = useState('login');
  const [otpFlow, setOtpFlow] = useState('login'); // 'login' | 'signup'

  const navigate = (target, param) => {
    switch (target) {
      case 'login':
        setScreen('login');
        break;
      case 'signup':
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
        onEnterApp?.(param || 'customer');
        break;
      case 'landing':
        setScreen('login');
        break;
      default:
        break;
    }
  };

  switch (screen) {
    case 'login':
      return <Login onNavigate={navigate} />;
    case 'signup':
      return <Signup onNavigate={navigate} />;
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
