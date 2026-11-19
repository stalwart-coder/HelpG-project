import { useNavigate } from 'react-router-dom';
import MyTasks from '../../screens/customer/MyTasks';

export default function MyTasksWrapper() {
  const navigate = useNavigate();

  const goDetail = (task) => {
    const id = task?._id || task?.id || task;
    navigate(`/customer/tasks/${id}`, { state: { task } });
  };

  const goRate = (task) => {
    const id = task?._id || task?.id || task;
    navigate(`/customer/rate/${id}`, { state: { task } });
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

