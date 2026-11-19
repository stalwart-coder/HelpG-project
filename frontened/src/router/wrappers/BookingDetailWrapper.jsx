import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import BookingDetail from '../../screens/helper/BookingDetail';
import { getBookingById } from '../../utils/bookingApi';

export default function BookingDetailWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const { acceptHelperTask, rejectBooking, startTask, markArrived, updateBookingStatus } = useApp();

  const [booking, setBooking] = useState(location.state?.booking || null);

  useEffect(() => {
    let active = true;
    if (!booking && bookingId) {
      getBookingById(bookingId)
        .then((b) => {
          if (active && b) setBooking(b);
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [booking, bookingId]);

  const onBack = () => navigate('/helper/bookings');

  const onAccept = async (id) => {
    await acceptHelperTask(id || bookingId);
  };

  const onReject = async (id, reason = '') => {
    await rejectBooking(id || bookingId, reason);
  };

  const onStart = async (id, note = '') => {
    await startTask(id || bookingId, note);
  };

  const onArrived = async (id, note = '') => {
    await markArrived(id || bookingId, note);
  };

  const onComplete = async (id, note = '') => {
    await updateBookingStatus(id || bookingId, 'completed', note);
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
