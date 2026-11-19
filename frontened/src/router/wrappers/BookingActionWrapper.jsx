import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CancelBooking from '../../screens/booking/CancelBooking';
import CancelSuccess from '../../screens/booking/CancelSuccess';
import RescheduleBooking from '../../screens/booking/RescheduleBooking';
import RescheduleSuccess from '../../screens/booking/RescheduleSuccess';
import ReportIssue from '../../screens/booking/ReportIssue';
import TipHelper from '../../screens/booking/TipHelper';
import RefundStatus from '../../screens/booking/RefundStatus';
import DisputeDetail from '../../screens/booking/DisputeDetail';
import RebookConfirmation from '../../screens/booking/RebookConfirmation';
import ReviewDetail from '../../screens/booking/ReviewDetail';
import { getBookingById } from '../../utils/bookingApi';

export default function BookingActionWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const action = searchParams.get('action') || 'cancel';
  const bookingId = searchParams.get('id');

  const [fetchedTask, setFetchedTask] = useState(null);
  const [currentStep, setCurrentStep] = useState(action);
  const [cancelResult, setCancelResult] = useState(null);
  const [rescheduleResult, setRescheduleResult] = useState(null);

  useEffect(() => {
    let active = true;
    if (bookingId) {
      getBookingById(bookingId)
        .then((b) => {
          if (active && b) setFetchedTask(b);
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [bookingId]);

  const taskData = {
    id: bookingId || 'HJ-0000',
    _id: bookingId,
    price: Number(searchParams.get('price')) || fetchedTask?.price || fetchedTask?.totalAmount || 385,
    totalAmount: Number(searchParams.get('price')) || fetchedTask?.totalAmount || 385,
    refundAmount: Number(searchParams.get('refund')) || Math.round((Number(searchParams.get('price')) || fetchedTask?.totalAmount || 385) * 0.9),
    category: searchParams.get('cat') || fetchedTask?.category || 'iron',
    cat: searchParams.get('cat') || fetchedTask?.category || 'iron',
    title: fetchedTask?.title || 'Service Booking',
    helper: fetchedTask?.helper || null,
    location: fetchedTask?.location || 'Home Address',
  };

  const onExit = () => navigate('/customer/tasks');

  switch (currentStep) {
    case 'cancel':
      return (
        <CancelBooking
          taskData={taskData}
          onBack={onExit}
          onConfirmed={(res) => {
            setCancelResult(res);
            setCurrentStep('cancel-success');
          }}
        />
      );

    case 'cancel-success':
      return (
        <CancelSuccess
          taskData={taskData}
          cancellationResult={cancelResult}
          onGoHome={onExit}
          onReschedule={() => setCurrentStep('reschedule')}
        />
      );

    case 'reschedule':
      return (
        <RescheduleBooking
          taskData={taskData}
          onBack={onExit}
          onConfirmed={(res) => {
            setRescheduleResult(res);
            setCurrentStep('reschedule-success');
          }}
        />
      );

    case 'reschedule-success':
      return (
        <RescheduleSuccess
          taskData={taskData}
          rescheduleResult={rescheduleResult}
          onGoHome={onExit}
        />
      );

    case 'report':
      return (
        <ReportIssue
          taskData={taskData}
          onBack={onExit}
          onConfirmed={onExit}
        />
      );

    case 'tip':
      return (
        <TipHelper
          taskData={taskData}
          onBack={onExit}
          onConfirmed={onExit}
        />
      );

    case 'refund':
      return (
        <RefundStatus
          refundId={bookingId}
          onBack={onExit}
        />
      );

    case 'dispute':
      return (
        <DisputeDetail
          disputeData={{
            id: `DSP-${bookingId?.slice(-6) || '2025'}`,
            bookingId: bookingId || 'HJ-0000',
            amount: taskData.price,
            reason: 'service_quality',
            status: 'investigating',
          }}
          onBack={onExit}
          onSubmitMessage={onExit}
        />
      );

    case 'rebook':
      return (
        <RebookConfirmation
          previousTask={taskData}
          onBack={onExit}
          onConfirmed={onExit}
        />
      );

    case 'review':
      return (
        <ReviewDetail
          reviewId={bookingId}
          onBack={onExit}
        />
      );

    default:
      return (
        <CancelBooking
          taskData={taskData}
          onBack={onExit}
          onConfirmed={(res) => {
            setCancelResult(res);
            setCurrentStep('cancel-success');
          }}
        />
      );
  }
}

