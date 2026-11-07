import { useNavigate } from 'react-router-dom';
import MyTasks from '../../screens/customer/MyTasks';

export default function MyTasksWrapper() {
  const navigate = useNavigate();

  const goDetail = (task) => {
    navigate(`/customer/tasks/${task.id}`, { state: { task } });
  };

  const goRate = (task) => {
    navigate(`/customer/rate/${task.id}`, { state: { task } });
  };

  const goPost = () => {
    navigate('/customer/post');
  };

  return (
    <MyTasks
      goDetail={goDetail}
      goRate={goRate}
      goPost={goPost}
    />
  );
}

