import { useNavigate, useLocation, useParams } from 'react-router-dom';
import TaskDetail from '../../screens/customer/TaskDetail';

export default function TaskDetailWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const task = location.state?.task || null;
  const effectiveId = taskId || task?._id || task?.id;

  const onBack = () => navigate('/customer/tasks');

  const onCancel = () => {
    navigate(`/cancel-reschedule?action=cancel&id=${effectiveId}&price=${task?.price || task?.totalAmount || 385}`);
  };

  const onReschedule = () => {
    navigate(`/cancel-reschedule?action=reschedule&id=${effectiveId}&price=${task?.price || task?.totalAmount || 385}`);
  };

  const onRate = () => {
    navigate(`/customer/rate/${effectiveId}`);
  };

  const onReportIssue = () => {
    navigate(`/cancel-reschedule?action=report&id=${effectiveId}`);
  };

  const onTip = () => {
    navigate(`/cancel-reschedule?action=tip&id=${effectiveId}`);
  };

  const onRefundStatus = () => {
    navigate(`/cancel-reschedule?action=refund&id=${effectiveId}`);
  };

  const onDispute = () => {
    navigate(`/cancel-reschedule?action=dispute&id=${effectiveId}`);
  };

  const onRebook = () => {
    navigate(`/cancel-reschedule?action=rebook&id=${effectiveId}`);
  };

  const onChat = () => {
    navigate('/customer/chat');
  };

  return (
    <TaskDetail
      bookingId={effectiveId}
      onBack={onBack}
      onCancel={onCancel}
      onReschedule={onReschedule}
      onRate={onRate}
      onReportIssue={onReportIssue}
      onTip={onTip}
      onRefundStatus={onRefundStatus}
      onDispute={onDispute}
      onRebook={onRebook}
      onChat={onChat}
    />
  );
}
