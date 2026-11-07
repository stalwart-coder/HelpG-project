import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingFlow from '../../screens/booking/BookingFlow';

export default function BookingFlowWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat');

  const onExit = () => navigate('/customer/home');

  return (
    <BookingFlow
      initialCategory={initialCategory}
      onExit={onExit}
    />
  );
}

