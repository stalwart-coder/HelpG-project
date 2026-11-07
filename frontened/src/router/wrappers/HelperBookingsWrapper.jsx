import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import HelperBookings from '../../screens/helper/Bookings';

export default function HelperBookingsWrapper() {
  const navigate = useNavigate();
  const { helperBookings, loadHelperBookings, helperLoading, helperError } = useApp();

  useEffect(() => {
    loadHelperBookings();
  }, [loadHelperBookings]);

  const goDetail = (booking) => {
    navigate(`/helper/bookings/${booking._id}`, { state: { booking } });
  };

  const goHome = () => navigate('/helper/home');

  const onRetry = () => {
    loadHelperBookings();
  };

  return (
    <HelperBookings
      bookings={helperBookings}
      loading={helperLoading}
      error={helperError}
      onRetry={onRetry}
      goDetail={goDetail}
      goHome={goHome}
    />
  );
}

