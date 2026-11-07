import { useNavigate, useSearchParams } from 'react-router-dom';
import PostTask from '../../screens/customer/PostTask';

export default function PostTaskWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');

  const onBack = () => {
    if (catParam) {
      navigate(`/customer/service/${catParam}`);
    } else {
      navigate('/customer/home');
    }
  };

  const onSubmitted = () => {
    navigate('/customer/tasks');
  };

  return (
    <PostTask
      presetCategory={catParam || null}
      onBack={onBack}
      onSubmitted={onSubmitted}
    />
  );
}

