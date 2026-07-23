import { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Landing from './pages/Landing';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import { myBookingsData } from './data/mockData';

// Customer screens
import CustomerHome from './screens/customer/Home';
import ServiceDetail from './screens/customer/ServiceDetail';
import PostTask from './screens/customer/PostTask';
import MyTasks from './screens/customer/MyTasks';
import TaskDetail from './screens/customer/TaskDetail';
import RateTask from './screens/customer/RateTask';
import CustomerWallet from './screens/customer/Wallet';
import CustomerProfile from './screens/customer/Profile';

// Helper screens
import HelperHome from './screens/helper/Home';
import HelperBookings from './screens/helper/Bookings';
import BookingDetail from './screens/helper/BookingDetail';
import HelperEarnings from './screens/helper/Earnings';
import HelperProfile from './screens/helper/Profile';

// ─── Customer routing ────────────────────────────────────────────────────────
//
//  home
//    └─ category card clicked ──► service-detail (category)
//         └─ "Book" clicked ──────► post (category pre-filled)
//              └─ submitted ───────► tasks
//    └─ "Post a task" clicked ───► post (no preset)
//         └─ submitted ───────────► tasks
//  tasks
//    └─ "Track" clicked ─────────► task-detail (task)
//    └─ "Rate" clicked ──────────► rate (task)           ← was wrongly → task-detail
//  task-detail                                            ← back → tasks
//  rate                                                   ← back → tasks
//  wallet
//  profile
//
// ─── Helper routing ──────────────────────────────────────────────────────────
//
//  home  (nearby tasks, accept)
//  bookings
//    └─ "Details" clicked ───────► booking-detail (booking)
//  booking-detail                                            ← back → bookings
//  earnings
//  profile

function AppShell({ initialMode, initialCategory, onExit }) {
  const [mode, setMode] = useState(initialMode || 'customer');

  // Customer state
  const [cScreen, setCScreen] = useState(initialCategory ? 'service-detail' : 'home');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Helper state
  const [hScreen, setHScreen] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [helperBookings, setHelperBookings] = useState(myBookingsData);

  // ── Customer navigation helpers ──────────────────────────────────────────
  const goHome = () => setCScreen('home');

  const goServiceDetail = (categoryId) => {
    setSelectedCategory(categoryId);
    setCScreen('service-detail');
  };

  const goPost = (categoryId) => {
    setSelectedCategory(categoryId || null);
    setCScreen('post');
  };

  const goTasks = () => setCScreen('tasks');

  const goTaskDetail = (task) => {
    setSelectedTask(task);
    setCScreen('task-detail');
  };

  const goRate = (task) => {
    setSelectedTask(task);
    setCScreen('rate');
  };

  const goWallet = () => setCScreen('wallet');
  const goProfile = () => setCScreen('profile');

  // ── Helper navigation helpers ─────────────────────────────────────────────
  const goBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setHScreen('booking-detail');
  };

  const goHelperHome = () => setHScreen('home');

  const acceptHelperTask = (task) => {
    setHelperBookings((prev) => {
      if (prev.some((b) => b.id === task.id)) return prev;
      return [{ ...task, status: 'progress' }, ...prev];
    });
  };

  const updateBookingStatus = (bookingId, status) => {
    setHelperBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
    setSelectedBooking((prev) =>
      prev?.id === bookingId ? { ...prev, status } : prev,
    );
  };

  // ── Mode switch resets both sub-navigations ───────────────────────────────
  const switchMode = (m) => {
    setMode(m);
    setCScreen('home');
    setHScreen('home');
  };

  // ── BottomNav tab handler — maps tab id → correct screen ─────────────────
  const handleTabChange = (tabId) => {
    if (mode === 'customer') {
      // Tab 'post' opens post form without a preset category
      if (tabId === 'post') { goPost(null); return; }
      if (tabId === 'home') { goHome(); return; }
      if (tabId === 'tasks') { goTasks(); return; }
      if (tabId === 'wallet') { goWallet(); return; }
      if (tabId === 'profile') { goProfile(); return; }
    } else {
      if (tabId === 'home') { setHScreen('home'); return; }
      if (tabId === 'bookings') { setHScreen('bookings'); return; }
      if (tabId === 'earnings') { setHScreen('earnings'); return; }
      if (tabId === 'profile') { setHScreen('profile'); return; }
    }
  };

  // ── Active tab indicator — maps current screen → tab id ──────────────────
  const activeTab = mode === 'customer'
    ? ({
        'home': 'home',
        'service-detail': 'home',
        'post': 'post',
        'tasks': 'tasks',
        'task-detail': 'tasks',
        'rate': 'tasks',
        'wallet': 'wallet',
        'profile': 'profile',
      }[cScreen] ?? 'home')
    : ({
        'home': 'home',
        'bookings': 'bookings',
        'booking-detail': 'bookings',
        'earnings': 'earnings',
        'profile': 'profile',
      }[hScreen] ?? 'home');

  // ── Screen renderers ──────────────────────────────────────────────────────
  const renderCustomerScreen = () => {
    switch (cScreen) {
      case 'home':
        return (
          <CustomerHome
            goServiceDetail={goServiceDetail}  // category card → service detail
            goPost={goPost}                    // "Post a task" CTA → post form
            goDetail={goTaskDetail}            // board task card → task detail
          />
        );
      case 'service-detail':
        return (
          <ServiceDetail
            category={selectedCategory}
            onBack={goHome}                    // back → home
            onBook={goPost}                    // "Book" CTA → post form (pre-filled)
          />
        );
      case 'post':
        return (
          <PostTask
            presetCategory={selectedCategory}
            onBack={() => {
              // back from post → go to service detail if we came from there, else home
              if (selectedCategory) {
                goServiceDetail(selectedCategory);
              } else {
                goHome();
              }
            }}
            onSubmitted={goTasks}              // after submit → my tasks
          />
        );
      case 'tasks':
        return (
          <MyTasks
            goDetail={goTaskDetail}            // "Track" → task detail
            goRate={goRate}                    // "Rate" → rate screen (was wrongly → task-detail)
            goPost={() => goPost(null)}        // empty state CTA → post form
          />
        );
      case 'task-detail':
        return (
          <TaskDetail
            task={selectedTask}
            onBack={goTasks}                   // back → my tasks
          />
        );
      case 'rate':
        return (
          <RateTask
            task={selectedTask}
            onBack={goTasks}                   // back → my tasks
            onSubmitted={goTasks}              // after rating → my tasks
          />
        );
      case 'wallet':
        return <CustomerWallet goPost={() => goPost(null)} />;
      case 'profile':
        return <CustomerProfile />;
      default:
        return <CustomerHome goServiceDetail={goServiceDetail} goPost={goPost} goDetail={goTaskDetail} />;
    }
  };

  const renderHelperScreen = () => {
    switch (hScreen) {
      case 'home':
        return (
          <HelperHome
            onAcceptTask={acceptHelperTask}
            onGoBookings={() => setHScreen('bookings')}
          />
        );
      case 'bookings':
        return (
          <HelperBookings
            bookings={helperBookings}
            goDetail={goBookingDetail}
            goHome={goHelperHome}
          />
        );
      case 'booking-detail':
        return (
          <BookingDetail
            booking={selectedBooking}
            onBack={() => setHScreen('bookings')}
            onUpdateStatus={updateBookingStatus}
          />
        );
      case 'earnings':
        return <HelperEarnings />;
      case 'profile':
        return <HelperProfile />;
      default:
        return <HelperHome onAcceptTask={acceptHelperTask} onGoBookings={() => setHScreen('bookings')} />;
    }
  };

  return (
    <div className="max-w-[520px] lg:max-w-[1080px] mx-auto min-h-screen bg-paper relative pb-[84px]">
      <TopBar mode={mode} setMode={switchMode} onExit={onExit} />
      {mode === 'customer' ? renderCustomerScreen() : renderHelperScreen()}
      <BottomNav
        mode={mode}
        screen={activeTab}
        setScreen={handleTabChange}
      />
    </div>
  );
}

// ── Root — switches between landing and app shell ─────────────────────────────
function Root() {
  const [view, setView] = useState('landing');
  const [initialMode, setInitialMode] = useState('customer');
  const [initialCategory, setInitialCategory] = useState(null);

  const enterApp = (mode, category = null) => {
    setInitialMode(mode);
    setInitialCategory(category);
    setView('app');
  };

  if (view === 'landing') {
    return (
      <Landing
        onGetStarted={() => enterApp('customer')}
        onBecomeHelper={() => enterApp('helper')}
        // Landing service cards → enter app at home, not directly at post
        // so the user sees the service detail page first
        onSelectService={(catId) => enterApp('customer', catId)}
      />
    );
  }

  return (
    <AppShell
      initialMode={initialMode}
      initialCategory={initialCategory}
      onExit={() => { setView('landing'); setInitialCategory(null); }}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Root />
    </LanguageProvider>
  );
}
