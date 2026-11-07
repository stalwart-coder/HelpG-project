import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Wallet, Banknote, CreditCard, Smartphone, Plus, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState } from '../../components/ui/PageState';
import { getWalletBalance, getWithdrawalHistory } from '../../utils/helperApi';

export default function Withdraw({ onBack, onConfirm, onAddBank, onAddUpi }) {
  const { t } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Load real balance and saved accounts from API
  useEffect(() => {
    setBalanceLoading(true);
    getWalletBalance()
      .then((data) => {
        setBalance(data?.balance ?? 0);
        // Load bank accounts from KYC profile if available
        const accounts = [];
        if (data?.upiId) {
          accounts.push({ id: 'upi-1', type: 'upi', label: 'UPI', account: data.upiId, name: data.name || '', default: true });
        }
        if (data?.accountNumber) {
          accounts.push({ id: 'bank-1', type: 'bank', label: data.bankName || 'Bank Account', account: `xxxx${data.accountNumber.slice(-4)}`, name: data.accountHolderName || '', default: !data?.upiId });
        }
        setSavedAccounts(accounts);
        setSelectedAccount(accounts.find((a) => a.default)?.id || accounts[0]?.id || null);
      })
      .catch(() => setBalance(0))
      .finally(() => setBalanceLoading(false));
  }, []);

  const amountNum = Number(amount || customAmount);
  const isValidAmount = amountNum > 0 && amountNum <= balance;

  const quickAmounts = [500, 1000, 2000, 3000];

  const handleAmountSelect = (val) => {
    setAmount(String(val));
    setCustomAmount('');
  };

  const handleProceed = () => {
    if (!selectedAccount) {
      setStatus('error');
      setErrorMsg('Please select a withdrawal account.');
      return;
    }
    if (!isValidAmount) {
      setStatus('error');
      setErrorMsg(`Enter a valid amount between ₹1 and ₹${(balance || 0).toLocaleString('en-IN')}.`);
      return;
    }
    setStatus('idle');
    onConfirm?.({
      account: savedAccounts.find((a) => a.id === selectedAccount),
      amount: amountNum,
    });
  };

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-[22px] font-display font-semibold mb-1">Withdraw to Bank</h2>
        <p className="text-sm text-ink-soft mb-6">Transfer your earnings to your bank or UPI.</p>

        {status === 'error' && (
          <div className="mb-4">
            <ErrorState title="Cannot proceed" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {/* Balance card */}
        <div className="bg-gradient-to-br from-ink to-[#2A3660] text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-marigold" />
            <span className="text-[11px] text-indigo-200/80 font-mono">Available Balance</span>
          </div>
          <div className="text-[32px] font-bold font-display mb-1">₹{(balance || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-indigo-200/60 font-mono">Withdrawable amount</div>
        </div>

        {/* Amount selection */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Select amount</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountSelect(val)}
                className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  amount === String(val)
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink border-line hover:border-ink/30'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-soft">₹</span>
            <input
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount('');
              }}
              placeholder="Enter custom amount"
              type="number"
              min="1"
              max={balance || 0}
              className="w-full pl-10 pr-4 py-3 border border-line rounded-lg text-lg font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40"
            />
          </div>

          {amount || customAmount ? (
            <div className={`mt-3 text-xs font-semibold ${!isValidAmount ? 'text-brick' : 'text-ink-soft'}`}>
              {!isValidAmount
                ? `Amount must be between ₹1 and ₹${(balance || 0).toLocaleString('en-IN')}`
                : `You will receive ₹${amountNum.toLocaleString('en-IN')}`}
            </div>
          ) : null}
        </div>

        {/* Saved accounts */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink">Withdraw to</h3>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onAddBank}
                className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-paper flex items-center gap-1"
              >
                <Plus size={14} /> Bank
              </button>
              <button
                type="button"
                onClick={onAddUpi}
                className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-paper flex items-center gap-1"
              >
                <Plus size={14} /> UPI
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {savedAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedAccount(acc.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  selectedAccount === acc.id
                    ? 'border-ink bg-ink/5 shadow-soft'
                    : 'border-line bg-white hover:border-ink/20'
                }`}
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  acc.type === 'bank' ? 'bg-banyan/10 text-banyan' : 'bg-marigold/10 text-marigold-deep'
                }`}>
                  {acc.type === 'bank' ? <Banknote size={20} /> : <Smartphone size={20} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink">{acc.label}</div>
                  <div className="text-xs text-ink-soft truncate">{acc.account}</div>
                </div>
                {acc.default && (
                  <span className="text-[10px] font-mono font-semibold text-banyan bg-banyan/10 px-2 py-0.5 rounded-full">
                    DEFAULT
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleProceed}
          disabled={!isValidAmount || !selectedAccount}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Proceed to withdraw <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

