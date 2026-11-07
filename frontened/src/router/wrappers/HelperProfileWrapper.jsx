import { useEffect } from 'react';
import HelperProfile from '../../screens/helper/Profile';
import { useApp } from '../../context/AppContext';

export default function HelperProfileWrapper() {
  const {
    helperProfile,
    loadHelperProfile,
    updateHelperProfile,
    loadAvailability,
    helperAvailability,
    loadSchedule,
    helperSchedule,
    updateSchedule,
    loadServiceAreas,
    serviceAreas,
    addServiceArea,
    removeServiceArea,
    helperLoading,
    helperError,
    helperBookings,
    loadHelperBookings,
  } = useApp();

  useEffect(() => {
    if (!helperProfile) {
      loadHelperProfile();
    }
    loadAvailability();
    loadSchedule();
    loadServiceAreas();
    loadHelperBookings();
  }, [loadHelperProfile, loadAvailability, loadSchedule, loadServiceAreas, loadHelperBookings, helperProfile]);

  return (
    <HelperProfile
      profileData={helperProfile}
      availability={helperAvailability}
      schedule={helperSchedule}
      serviceAreas={serviceAreas}
      loading={helperLoading}
      error={helperError}
      activeTasks={helperBookings}
      onUpdateProfile={updateHelperProfile}
      onUpdateSchedule={updateSchedule}
      onAddServiceArea={addServiceArea}
      onRemoveServiceArea={removeServiceArea}
      onRetry={loadHelperProfile}
    />
  );
}

