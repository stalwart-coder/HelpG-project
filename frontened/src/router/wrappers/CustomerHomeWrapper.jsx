import { useNavigate } from 'react-router-dom';
import CustomerHome from '../../screens/customer/Home';

export default function CustomerHomeWrapper() {
  const navigate = useNavigate();

  const goServiceDetail = (categoryId) => {
    navigate(`/customer/service/${categoryId}`);
  };

  const goPost = (categoryId) => {
    if (categoryId) {
      navigate(`/customer/post?cat=${categoryId}`);
    } else {
      navigate('/customer/post');
    }
  };

  const goDetail = (task) => {
    const id = typeof task === 'object' ? (task?._id || task?.id) : task;
    navigate(`/customer/tasks/${id}`, { state: { task: typeof task === 'object' ? task : undefined } });
  };

  return (
    <CustomerHome
      goServiceDetail={goServiceDetail}
      goPost={goPost}
      goDetail={goDetail}
    />
  );
}

