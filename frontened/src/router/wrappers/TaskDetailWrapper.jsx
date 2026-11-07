import { useNavigate, useLocation } from 'react-router-dom';
import TaskDetail from '../../screens/customer/TaskDetail';

export default function TaskDetailWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task || null;

  const onBack = () => navigate('/customer/tasks');

  return <TaskDetail task={task} onBack={onBack} />;
}

