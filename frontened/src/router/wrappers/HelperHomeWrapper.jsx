import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import HelperHome from '../../screens/helper/Home';

export default function HelperHomeWrapper() {
  const navigate = useNavigate();
  const { acceptHelperTask, toggleAvailability, loadAvailability, helperAvailability, helperProfile, loadHelperProfile } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    loadAvailability();
    if (!helperProfile) {
      loadHelperProfile();
    }
  }, [loadAvailability, loadHelperProfile, helperProfile]);

  const onGoBookings = () => navigate('/helper/bookings');

  const onToggleAvailability = async (isAvailable) => {
    await toggleAvailability(isAvailable);
  };

  return (
    <HelperHome
      onAcceptTask={(bookingId) => acceptHelperTask(bookingId)}
      onGoBookings={onGoBookings}
      onGoKyc={() => navigate('/helper/kyc')}
      onToggleAvailability={onToggleAvailability}
      availability={helperAvailability}
      profile={helperProfile || user}
    />
  );
}

