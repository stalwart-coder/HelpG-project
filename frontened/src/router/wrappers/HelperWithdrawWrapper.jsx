import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Withdraw from '../../screens/wallet/Withdraw';
import AddBankAccount from '../../screens/wallet/AddBankAccount';
import AddUpiId from '../../screens/wallet/AddUpiId';
import WithdrawConfirmation from '../../screens/wallet/WithdrawConfirmation';
import WithdrawSuccess from '../../screens/wallet/WithdrawSuccess';

export default function HelperWithdrawWrapper() {
  const navigate = useNavigate();
  const [step, setStep] = useState('withdraw'); // withdraw | add_bank | add_upi | confirm | success
  const [withdrawData, setWithdrawData] = useState(null);
  const [withdrawalResult, setWithdrawalResult] = useState(null);

  const handleBack = () => {
    if (step === 'withdraw') {
      navigate('/helper/earnings');
    } else {
      setStep('withdraw');
    }
  };

  const handleConfirmReady = (data) => {
    setWithdrawData(data);
    setStep('confirm');
  };

  const handleWithdrawComplete = (result) => {
    setWithdrawalResult(result);
    setStep('success');
  };

  switch (step) {
    case 'add_bank':
      return (
        <div className="max-w-xl mx-auto py-4">
          <AddBankAccount
            onBack={() => setStep('withdraw')}
            onSave={() => setStep('withdraw')}
          />
        </div>
      );

    case 'add_upi':
      return (
        <div className="max-w-xl mx-auto py-4">
          <AddUpiId
            onBack={() => setStep('withdraw')}
            onSave={() => setStep('withdraw')}
          />
        </div>
      );

    case 'confirm':
      return (
        <div className="max-w-xl mx-auto py-4">
          <WithdrawConfirmation
            data={withdrawData}
            onBack={() => setStep('withdraw')}
            onConfirm={handleWithdrawComplete}
          />
        </div>
      );

    case 'success':
      return (
        <div className="max-w-xl mx-auto py-4">
          <WithdrawSuccess
            data={withdrawalResult || withdrawData}
            onBack={() => navigate('/helper/earnings')}
            onDone={() => navigate('/helper/earnings')}
          />
        </div>
      );

    case 'withdraw':
    default:
      return (
        <div className="max-w-xl mx-auto py-4">
          <Withdraw
            onBack={handleBack}
            onConfirm={handleConfirmReady}
            onAddBank={() => setStep('add_bank')}
            onAddUpi={() => setStep('add_upi')}
          />
        </div>
      );
  }
}
