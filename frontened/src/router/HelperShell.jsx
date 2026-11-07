import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function HelperShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, switchMode } = useApp();

  const handleExit = () => navigate('/');
  const handleSwitchMode = (m) => {
    switchMode(m);
    if (m === 'helper') navigate('/helper/home');
    else navigate('/customer/home');
  };

  const path = location.pathname;
  let activeTab = 'home';
  if (path.startsWith('/helper/bookings')) activeTab = 'bookings';
  else if (path.startsWith('/helper/earnings')) activeTab = 'earnings';
  else if (path.startsWith('/helper/profile')) activeTab = 'profile';

  // Hide BottomNav on focused booking detail to prevent bottom collision
  const hideBottomNav = path.includes('/bookings/') || path.includes('/kyc');

  const handleTabChange = (tabId) => {
    switch (tabId) {
      case 'home': navigate('/helper/home'); break;
      case 'bookings': navigate('/helper/bookings'); break;
      case 'earnings': navigate('/helper/earnings'); break;
      case 'profile': navigate('/helper/profile'); break;
      default: break;
    }
  };

  return (
    <div
      className="w-full min-h-screen relative pb-28 transition-colors duration-200"
      style={{ background: 'var(--hj-paper)', color: 'var(--hj-ink)' }}
    >
      <TopBar mode={mode} setMode={handleSwitchMode} onExit={handleExit} />
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Outlet />
      </main>
      {!hideBottomNav && (
        <BottomNav
          mode="helper"
          screen={activeTab}
          setScreen={handleTabChange}
        />
      )}
    </div>
  );
}
