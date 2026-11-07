import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import KycFlow from '../../screens/kyc/KycFlow';
import KycPending from '../../screens/kyc/KycPending';
import KycApproved from '../../screens/kyc/KycApproved';
import KycRejected from '../../screens/kyc/KycRejected';
import { getKycStatus, submitKyc, resubmitKyc } from '../../utils/kycApi';
import { Loader2 } from 'lucide-react';

export default function HelperKycWrapper() {
  const navigate = useNavigate();
  const [kycRecord, setKycRecord] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'flow' | 'pending' | 'verified' | 'rejected'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getKycStatus();
      const kyc = res?.kyc || res;
      setKycRecord(kyc);

      const kycState = kyc?.status;
      if (kycState === 'verified') {
        setStatus('verified');
      } else if (kycState === 'submitted' || kycState === 'pending') {
        setStatus('pending');
      } else if (kycState === 'rejected') {
        setStatus('rejected');
      } else {
        setStatus('flow');
      }
    } catch {
      // If no KYC record exists yet, proceed with flow
      setStatus('flow');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleComplete = async (kycData) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        personalInfo: kycData.personal || {},
        aadhaar: {
          number: kycData.aadhaar?.aadhaarNumber || '',
          frontImage: kycData.aadhaar?.frontFile || '',
          backImage: kycData.aadhaar?.backFile || '',
        },
        pan: {
          number: kycData.pan?.panNumber || '',
          image: kycData.pan?.panFile || '',
          nameOnPan: kycData.pan?.fullNameOnPan || '',
        },
        selfie: {
          url: kycData.selfie?.url || '',
        },
        bankDetails: kycData.bank || {},
      };

      if (kycRecord?.status === 'rejected') {
        await resubmitKyc(payload);
      } else {
        await submitKyc(payload);
      }

      setStatus('pending');
    } catch (err) {
      alert(err.message || 'Failed to submit KYC documents. Please verify data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || submitting) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-mono">
          {submitting ? 'Encrypting and submitting verification dossier...' : 'Checking verification status...'}
        </p>
      </div>
    );
  }

  if (status === 'verified') {
    return <KycApproved onDone={() => navigate('/helper/home')} />;
  }

  if (status === 'pending') {
    return <KycPending onBack={() => navigate('/helper/home')} />;
  }

  if (status === 'rejected') {
    return (
      <KycRejected
        rejectionReason={kycRecord?.rejectionReason || 'Documents could not be verified.'}
        onRetry={() => setStatus('flow')}
        onBack={() => navigate('/helper/home')}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <KycFlow onComplete={handleComplete} onExit={() => navigate('/helper/home')} />
    </div>
  );
}
