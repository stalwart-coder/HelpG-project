import { useNavigate, useLocation } from 'react-router-dom';
import RateTask from '../../screens/customer/RateTask';

export default function RateTaskWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || null;

  const onBack = () => navigate('/customer/tasks');
  const onSubmitted = () => navigate('/customer/tasks');

  return <RateTask task={task} onBack={onBack} onSubmitted={onSubmitted} />;
}

