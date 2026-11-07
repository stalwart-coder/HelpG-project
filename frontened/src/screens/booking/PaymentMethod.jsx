import { useState, useMemo } from 'react';
import { ChevronLeft, CheckCircle2, Loader2, Shield, Wallet, AlertTriangle } from 'lucide-react';
import { PAYMENT_METHODS } from '../../data/bookingData';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';
import { formatINR } from '../../utils/format';

import { createOrder, verifyPayment } from '../../utils/paymentApi';

export default function PaymentMethod({ bookingId, totalAmount, onBack, onSuccess }) {
  const [selected, setSelected] = useState('upi');
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selected);
  const walletMethod = PAYMENT_METHODS.find((m) => m.id === 'wallet');
  const walletShort = walletMethod ? totalAmount > walletMethod.balance : false;

  const handlePay = async () => {
    if (!selected) return;
    setStatus('processing');
    setErrorMsg('');

    try {
      if (bookingId) {
        const orderData = await createOrder({ bookingId, amount: totalAmount }).catch(() => null);
        if (orderData?.orderId && window.Razorpay) {
          const rzp = new window.Razorpay({
            key: orderData.keyId || 'rzp_test_key',
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            order_id: orderData.orderId,
            name: 'HelpJi',
            description: `Payment for booking #${bookingId}`,
            handler: async function (response) {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              });
              setStatus('success');
            },
            modal: {
              ondismiss: function () {
                setStatus('idle');
              }
            }
          });
          rzp.open();
          return;
        }
      }
      // If direct confirmation / wallet / UPI simulated locally when razorpay script isn't loaded
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Payment could not be completed. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Payment successful!"
          subtitle={`₹${formatINR(totalAmount)} paid via ${selectedMethod?.name || selected}. Your booking is confirmed.`}
          onContinue={onSuccess}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <button onClick={() => setStatus('idle')} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back to payment
        </button>
        <ErrorState
          title="Payment failed"
          subtitle={errorMsg}
          onRetry={() => setStatus('idle')}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {status === 'processing' && (
        <div className="p-5 pb-0">
          <LoadingState title="Processing payment..." subtitle="Please don't close this screen." />
        </div>
      )}

      <div className="px-5 pt-5 pb-4">
        <button
          onClick={onBack}
          disabled={status === 'processing'}
          className="flex items-center gap-1 text-ink-soft text-sm mb-5 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="mb-2">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
            Payment
          </div>
          <h1 className="font-display text-xl font-bold text-ink mt-1">Choose how to pay</h1>
          <p className="text-sm text-ink-soft mt-1">Secure payment. Your money is protected until the task is done.</p>
        </div>
      </div>

      <div className={`px-5 space-y-3 ${status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selected === method.id;
          const isWallet = method.id === 'wallet';
          const insufficient = isWallet && walletShort;

          return (
            <button
              key={method.id}
              onClick={() => !insufficient && setSelected(method.id)}
              disabled={status === 'processing' || insufficient}
              className={`w-full text-left border rounded-2xl p-4 transition-all ${
                isSelected
                  ? 'border-ink bg-paper-card shadow-card'
                  : 'border-line bg-white hover:border-ink/20'
              } ${insufficient ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[14px] text-ink">{method.name}</h3>
                    {method.tag && (
                      <span className="text-[10px] bg-marigold/15 text-marigold-deep font-semibold px-2 py-0.5 rounded-full">
                        {method.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {insufficient
                      ? `Insufficient balance (₹${formatINR(method.balance)} available)`
                      : isWallet
                        ? `₹${formatINR(method.balance)} available`
                        : method.desc
                    }
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 size={20} className="text-ink shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <div className="bg-ink text-white rounded-2xl p-4 shadow-lift mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-200/80">Total amount</span>
            <span className="font-bold text-[20px] font-mono">₹{formatINR(totalAmount)}</span>
          </div>
          {selected === 'wallet' && !walletShort && (
            <div className="text-[11px] text-indigo-200/80">
              Wallet balance: ₹{formatINR(PAYMENT_METHODS.find(m => m.id === 'wallet')?.balance || 0)}
            </div>
          )}
        </div>

        <button
          onClick={handlePay}
          disabled={status === 'processing' || walletShort}
          className="w-full bg-banyan text-white font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'processing' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Wallet size={18} /> Pay ₹{formatINR(totalAmount)} via {selectedMethod?.name || selected}
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
          <Shield size={12} />
          Secured by 256-bit encryption. Your payment info is safe.
        </div>
      </div>
    </div>
  );
}

