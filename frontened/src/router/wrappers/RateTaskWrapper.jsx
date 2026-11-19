import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import RateTask from '../../screens/customer/RateTask';
import { getBookingById } from '../../utils/bookingApi';

export default function RateTaskWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const [task, setTask] = useState(location.state?.task || null);

  useEffect(() => {
    let active = true;
    if (!task && taskId) {
      getBookingById(taskId)
        .then((b) => {
          if (active && b) {
            setTask({
              ...b,
              id: b._id || b.id || taskId,
              cat: b.category || b.cat || 'iron',
            });
          }
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [task, taskId]);

  const onBack = () => navigate('/customer/tasks');
  const onSubmitted = () => navigate('/customer/tasks');

  return <RateTask task={task} onBack={onBack} onSubmitted={onSubmitted} />;
}
