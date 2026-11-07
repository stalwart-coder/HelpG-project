import { useState } from 'react';
import { ChevronLeft, Banknote, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState, SuccessState } from '../../components/ui/PageState';
import { updateBankDetails } from '../../utils/kycApi';

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Yes Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
];

export default function AddBankAccount({ onBack, onSave }) {
  const { t } = useLanguage();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ──────────────────────────────────────────────────────────
  const errors = {};
  const holderTrim = accountHolder.trim();
  if (!holderTrim) errors.holder = 'Account holder name is required.';
  else if (holderTrim.length < 3) errors.holder = 'Enter a valid full name.';

  if (!bankName) errors.bank = 'Select your bank.';

  const accTrim = accountNumber.trim();
  if (!accTrim) errors.account = 'Account number is required.';
  else if (accTrim.length < 9 || accTrim.length > 18) errors.account = 'Account number must be 9-18 digits.';
  else if (!/^\d+$/.test(accTrim)) errors.account = 'Account number must contain only digits.';

  const confirmTrim = confirmAccount.trim();
  if (!confirmTrim) errors.confirm = 'Please confirm your account number.';
  else if (confirmTrim !== accTrim) errors.confirm = 'Account numbers do not match.';

  const ifscTrim = ifsc.trim().toUpperCase();
  if (!ifscTrim) errors.ifsc = 'IFSC code is required.';
  else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscTrim)) errors.ifsc = 'Enter a valid IFSC code (e.g. HDFC0001234).';

  const canSubmit = Object.keys(errors).length === 0 && status !== 'loading';

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleBankSearch = (query) => {
    setBankName(query);
    if (query.length > 0) {
      const results = BANKS.filter((b) => b.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const selectBank = (name) => {
    setBankName(name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      await updateBankDetails({
        bankName,
        accountNumber: accTrim,
        ifscCode: ifscTrim,
        accountHolderName: holderTrim,
      });
      setStatus('success');
      onSave?.({
        type: 'bank',
        bankName,
        accountNumber: accTrim,
        ifsc: ifscTrim,
        accountHolder: holderTrim,
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not add bank account. Please check details and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Bank account added"
          subtitle={`${bankName} account ending ${accTrim.slice(-4)} has been saved.`}
          onContinue={onBack}
        />
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
          disabled={status === 'loading'}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-banyan/10 text-banyan flex items-center justify-center">
            <Banknote size={24} />
          </div>
          <div>
            <h2 className="text-[20px] font-display font-semibold">Add Bank Account</h2>
            <p className="text-xs text-ink-soft">Funds will be transferred to this account</p>
          </div>
        </div>

        {status === 'error' && (
          <div className="mb-4">
            <ErrorState title="Failed to add account" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {status === 'loading' && (
          <div className="bg-paper-card border border-line rounded-xl p-6 shadow-card mb-6 text-center">
            <Loader2 size={24} className="animate-spin text-marigold-deep mx-auto mb-3" />
            <p className="text-sm font-semibold">Verifying bank details...</p>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          noValidate
          className={status === 'loading' ? 'opacity-50 pointer-events-none' : ''}
        >
          {/* Account holder name */}
          <div className="mb-4">
            <label htmlFor="bank-holder" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Account holder name
            </label>
            <input
              id="bank-holder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="As on bank account"
              disabled={status === 'loading'}
              aria-invalid={!!errors.holder}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {errors.holder && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.holder}
              </div>
            )}
          </div>

          {/* Bank name */}
          <div className="mb-4 relative">
            <label htmlFor="bank-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Bank name
            </label>
            <input
              id="bank-name"
              value={bankName}
              onChange={(e) => handleBankSearch(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search your bank"
              disabled={status === 'loading'}
              aria-invalid={!!errors.bank}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-line rounded-lg shadow-lift max-h-40 overflow-y-auto">
                {searchResults.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => selectBank(name)}
                    className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-paper transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            {errors.bank && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.bank}
              </div>
            )}
          </div>

          {/* Account number */}
          <div className="mb-4">
            <label htmlFor="bank-account" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Account number
            </label>
            <input
              id="bank-account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))}
              placeholder="Enter account number"
              disabled={status === 'loading'}
              aria-invalid={!!errors.account}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {errors.account && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.account}
              </div>
            )}
          </div>

          {/* Confirm account */}
          <div className="mb-4">
            <label htmlFor="bank-confirm" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Confirm account number
            </label>
            <input
              id="bank-confirm"
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, '').slice(0, 18))}
              placeholder="Re-enter account number"
              disabled={status === 'loading'}
              aria-invalid={!!errors.confirm}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {errors.confirm && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.confirm}
              </div>
            )}
            {confirmTrim && confirmTrim === accTrim && accTrim.length >= 9 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-banyan">
                <CheckCircle2 size={13} /> Account numbers match
              </div>
            )}
          </div>

          {/* IFSC */}
          <div className="mb-6">
            <label htmlFor="bank-ifsc" className="block text-xs font-semibold text-ink-soft mb-1.5">
              IFSC code
            </label>
            <input
              id="bank-ifsc"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
              placeholder="e.g. HDFC0001234"
              disabled={status === 'loading'}
              aria-invalid={!!errors.ifsc}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60 font-mono"
            />
            {errors.ifsc && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.ifsc}
              </div>
            )}
            {ifscTrim.length === 11 && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscTrim) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-banyan">
                <CheckCircle2 size={13} /> Valid IFSC format
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40"
          >
            Save bank account
          </button>
        </form>
      </div>
    </div>
  );
}

