import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';

// Auth screens
import AuthRouterWrapper from './wrappers/AuthRouterWrapper';

// Customer shell
import CustomerShell from './CustomerShell';
import CustomerHomeWrapper from './wrappers/CustomerHomeWrapper';
import ServiceDetailWrapper from './wrappers/ServiceDetailWrapper';
import PostTaskWrapper from './wrappers/PostTaskWrapper';
import MyTasksWrapper from './wrappers/MyTasksWrapper';
import TaskDetailWrapper from './wrappers/TaskDetailWrapper';
import RateTaskWrapper from './wrappers/RateTaskWrapper';
import CustomerWalletWrapper from './wrappers/CustomerWalletWrapper';
import CustomerProfileWrapper from './wrappers/CustomerProfileWrapper';

// Helper shell
import HelperShell from './HelperShell';
import HelperHomeWrapper from './wrappers/HelperHomeWrapper';
import HelperBookingsWrapper from './wrappers/HelperBookingsWrapper';
import BookingDetailWrapper from './wrappers/BookingDetailWrapper';
import HelperEarningsWrapper from './wrappers/HelperEarningsWrapper';
import HelperProfileWrapper from './wrappers/HelperProfileWrapper';
import HelperKycWrapper from './wrappers/HelperKycWrapper';

// Booking flows (full-screen, no shell)
import BookingFlowWrapper from './wrappers/BookingFlowWrapper';
import CancelRescheduleFlowWrapper from './wrappers/CancelRescheduleFlowWrapper';

// Protected route wrapper
import ProtectedRoute from './ProtectedRoute';

// Admin screens
import AdminLogin from '../screens/admin/AdminLogin';
import AdminShell from '../screens/admin/AdminShell';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminKyc from '../screens/admin/AdminKyc';
import AdminBookings from '../screens/admin/AdminBookings';
import AdminTickets from '../screens/admin/AdminTickets';
import AdminAuditLogs from '../screens/admin/AdminAuditLogs';
import AdminProtectedRoute from './AdminProtectedRoute';

// ── Landing with navigation helpers ─────────────────────────────────────────
function LandingWithNav() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const onGetStarted = () => {
    if (isAuthenticated) {
      navigate('/customer/home');
    } else {
      navigate('/auth');
    }
  };

  const onBecomeHelper = () => {
    if (isAuthenticated) {
      navigate('/helper/home');
    } else {
      navigate('/auth');
    }
  };

  const onSelectService = (catId) => {
    if (isAuthenticated) {
      navigate(`/customer/service/${catId}`);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(`/customer/service/${catId}`)}`);
    }
  };

  return (
    <Landing
      onGetStarted={onGetStarted}
      onBecomeHelper={onBecomeHelper}
      onSelectService={onSelectService}
    />
  );
}

// ── Main Router ────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/" element={<LandingWithNav />} />
      <Route path="/auth" element={<AuthRouterWrapper />} />
      <Route path="/login" element={<AuthRouterWrapper />} />

      {/* ── Booking flows (full-screen, no shell) ─────────────────── */}
      <Route path="/booking" element={<BookingFlowWrapper />} />
      <Route path="/cancel-reschedule" element={<CancelRescheduleFlowWrapper />} />

      {/* ── Protected routes ──────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        {/* Customer */}
        <Route path="/customer" element={<CustomerShell />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<CustomerHomeWrapper />} />
          <Route path="service/:cat" element={<ServiceDetailWrapper />} />
          <Route path="post" element={<PostTaskWrapper />} />
          <Route path="tasks" element={<MyTasksWrapper />} />
          <Route path="tasks/:taskId" element={<TaskDetailWrapper />} />
          <Route path="rate/:taskId" element={<RateTaskWrapper />} />
          <Route path="wallet" element={<CustomerWalletWrapper />} />
          <Route path="profile" element={<CustomerProfileWrapper />} />
        </Route>

        {/* Helper */}
        <Route path="/helper" element={<HelperShell />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HelperHomeWrapper />} />
          <Route path="bookings" element={<HelperBookingsWrapper />} />
          <Route path="bookings/:bookingId" element={<BookingDetailWrapper />} />
          <Route path="earnings" element={<HelperEarningsWrapper />} />
          <Route path="profile" element={<HelperProfileWrapper />} />
          <Route path="kyc" element={<HelperKycWrapper />} />
        </Route>
      </Route>

      {/* ── Admin Portal ────────────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kyc" element={<AdminKyc />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Route>

      {/* ── 404 ───────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

