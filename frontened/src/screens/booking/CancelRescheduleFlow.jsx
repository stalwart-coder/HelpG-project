import { useState } from 'react';
import CancelBooking from './CancelBooking';
import CancelSuccess from './CancelSuccess';
import RescheduleBooking from './RescheduleBooking';
import RescheduleSuccess from './RescheduleSuccess';

// ── Cancel / Reschedule Flow ─────────────────────────────────────────────────
//
//  cancel
//    └─ confirmed ──► cancel-success
//                      └─ "Reschedule" ──► reschedule
//                      └─ "Go Home" ────► exit
//
//  reschedule
//    └─ confirmed ──► reschedule-success
//                      └─ "Go Home" ────► exit
//
export default function CancelRescheduleFlow({ taskData, initialAction, onExit }) {
  const [screen, setScreen] = useState(initialAction || 'cancel'); // cancel | cancel-success | reschedule | reschedule-success
  const [cancelResult, setCancelResult] = useState(null);
  const [rescheduleResult, setRescheduleResult] = useState(null);

  const handleCancelConfirmed = (result) => {
    setCancelResult(result);
    setScreen('cancel-success');
  };

  const handleReschedule = () => {
    setScreen('reschedule');
  };

  const handleRescheduleConfirmed = (result) => {
    setRescheduleResult(result);
    setScreen('reschedule-success');
  };

  switch (screen) {
    case 'cancel':
      return (
        <CancelBooking
          taskData={taskData}
          onBack={() => onExit?.()}
          onConfirmed={handleCancelConfirmed}
        />
      );

    case 'cancel-success':
      return (
        <CancelSuccess
          taskData={{ ...taskData, refundAmount: taskData?.refundAmount || Math.round((taskData?.price || 385) * 0.9) }}
          cancellationResult={cancelResult}
          onGoHome={() => onExit?.()}
          onReschedule={handleReschedule}
        />
      );

    case 'reschedule':
      return (
        <RescheduleBooking
          taskData={taskData}
          onBack={() => setScreen('cancel-success')}
          onConfirmed={handleRescheduleConfirmed}
        />
      );

    case 'reschedule-success':
      return (
        <RescheduleSuccess
          taskData={taskData}
          rescheduleResult={rescheduleResult}
          onGoHome={() => onExit?.()}
        />
      );

    default:
      return (
        <CancelBooking
          taskData={taskData}
          onBack={() => onExit?.()}
          onConfirmed={handleCancelConfirmed}
        />
      );
  }
}

