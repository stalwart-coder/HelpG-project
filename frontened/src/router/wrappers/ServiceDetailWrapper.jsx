import { useNavigate, useParams } from 'react-router-dom';
import ServiceDetail from '../../screens/customer/ServiceDetail';

export default function ServiceDetailWrapper() {
  const navigate = useNavigate();
  const { cat } = useParams();

  const onBack = () => navigate('/customer/home');
  const onBook = (bookingId) => {
    navigate('/customer/tasks');
  };

  return (
    <ServiceDetail
      category={cat}
      onBack={onBack}
      onBook={onBook}
    />
  );
}
