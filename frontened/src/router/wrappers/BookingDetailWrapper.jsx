import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import BookingDetail from '../../screens/helper/BookingDetail';

export default function BookingDetailWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { acceptHelperTask, rejectBooking, startTask, markArrived, updateBookingStatus } = useApp();
  const booking = location.state?.booking || null;

  const onBack = () => navigate('/helper/bookings');

  const onAccept = async (bookingId) => {
    await acceptHelperTask(bookingId);
  };

  const onReject = async (bookingId, reason = '') => {
    await rejectBooking(bookingId, reason);
  };

  const onStart = async (bookingId, note = '') => {
    await startTask(bookingId, note);
  };

  const onArrived = async (bookingId, note = '') => {
    await markArrived(bookingId, note);
  };

  const onComplete = async (bookingId, note = '') => {
    await updateBookingStatus(bookingId, 'completed', note);
  };

  return (
    <BookingDetail
      booking={booking}
      onBack={onBack}
      onAccept={onAccept}
      onReject={onReject}
      onStart={onStart}
      onArrived={onArrived}
      onComplete={onComplete}
    />
  );
}

