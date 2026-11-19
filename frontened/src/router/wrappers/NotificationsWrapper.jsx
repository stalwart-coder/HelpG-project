import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../screens/chat/NotificationCenter';

export default function NotificationsWrapper() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      <NotificationCenter onBack={handleBack} />
    </div>
  );
}

