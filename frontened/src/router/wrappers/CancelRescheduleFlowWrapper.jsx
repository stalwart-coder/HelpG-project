import { useNavigate, useSearchParams } from 'react-router-dom';
import CancelRescheduleFlow from '../../screens/booking/CancelRescheduleFlow';

export default function CancelRescheduleFlowWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const action = searchParams.get('action') || 'cancel';
  const taskData = {
    id: searchParams.get('id') || 'HJ-0000',
    price: Number(searchParams.get('price')) || 385,
    refundAmount: Number(searchParams.get('refund')) || Math.round((Number(searchParams.get('price')) || 385) * 0.9),
    cat: searchParams.get('cat') || 'iron',
  };

  const onExit = () => navigate('/customer/tasks');

  return (
    <CancelRescheduleFlow
      taskData={taskData}
      initialAction={action}
      onExit={onExit}
    />
  );
}

