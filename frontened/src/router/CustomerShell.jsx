import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function CustomerShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, switchMode } = useApp();

  const handleExit = () => navigate('/');
  const handleSwitchMode = (m) => {
    switchMode(m);
    if (m === 'helper') navigate('/helper/home');
    else navigate('/customer/home');
  };

  // Determine active tab from path
  const path = location.pathname;
  let activeTab = 'home';
  if (path.startsWith('/customer/tasks') || path.startsWith('/customer/rate')) activeTab = 'tasks';
  else if (path.startsWith('/customer/post')) activeTab = 'post';
  else if (path.startsWith('/customer/wallet')) activeTab = 'wallet';
  else if (path.startsWith('/customer/profile')) activeTab = 'profile';

  // Hide BottomNav on focused booking flows to prevent overlapping bottom action bars
  const hideBottomNav = path.startsWith('/customer/service/') || path.startsWith('/customer/rate/');

  const handleTabChange = (tabId) => {
    switch (tabId) {
      case 'home': navigate('/customer/home'); break;
      case 'tasks': navigate('/customer/tasks'); break;
      case 'post': navigate('/customer/post'); break;
      case 'wallet': navigate('/customer/wallet'); break;
      case 'profile': navigate('/customer/profile'); break;
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
          mode="customer"
          screen={activeTab}
          setScreen={handleTabChange}
        />
      )}
    </div>
  );
}
