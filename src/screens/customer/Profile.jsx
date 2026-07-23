import { useEffect, useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import HelperMini from '../../components/HelperMini';
import { customerProfile } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonPage } from '../../components/ui/PageState';

function EditProfileModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const inputCls =
    'w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40';

  const nameTrim = name.trim();
  const locTrim = location.trim();

  const errors = {
    name:
      !nameTrim
        ? 'Name is required.'
        : nameTrim.length < 3
        ? 'Name must be at least 3 characters.'
        : '',
    location:
      !locTrim
        ? 'Location is required.'
        : locTrim.length < 3
        ? 'Location must be at least 3 characters.'
        : '',
  };

  const canSave = !errors.name && !errors.location && status !== 'loading';

  const handleSave = () => {
    if (!canSave) return;
    setStatus('loading');
    setErrorMsg('');

    setTimeout(() => {
      const shouldError = Math.random() < 0.08;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Couldn’t save changes. Try again.');
        return;
      }

      onSave({ name: nameTrim, location: locTrim });
      setStatus('success');
    }, 850);
  };

  const resetForm = () => {
    setName(profile.name);
    setLocation(profile.location);
    setStatus('idle');
    setErrorMsg('');
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
        <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
          <SuccessState
            title="Profile updated"
            subtitle="Your details have been saved."
            onContinue={onClose}
          />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
        <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
          <ErrorState title="Save failed" subtitle={errorMsg} onRetry={handleSave} retryLabel="Retry" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[17px]">Edit profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-card" disabled={status === 'loading'}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          noValidate
        >
        <div className="mb-4">
          <label htmlFor="customer-profile-name" className="block text-xs font-semibold text-ink-soft mb-1.5">Full name</label>
          <input
            id="customer-profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            disabled={status === 'loading'}
            aria-invalid={!!errors.name}
            aria-describedby="customer-profile-name-error"
            autoComplete="name"
          />
          {errors.name && (
            <div id="customer-profile-name-error" className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertTriangle size={14} /> {errors.name}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="customer-profile-location" className="block text-xs font-semibold text-ink-soft mb-1.5">Location</label>
          <input
            id="customer-profile-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
            disabled={status === 'loading'}
            aria-invalid={!!errors.location}
            aria-describedby="customer-profile-location-error"
            autoComplete="street-address"
          />
          {errors.location && (
            <div id="customer-profile-location-error" className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertTriangle size={14} /> {errors.location}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSave}
          className="w-full bg-marigold text-ink py-3.5 rounded-xl font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Saving…
            </span>
          ) : (
            'Save changes'
          )}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={status === 'loading'}
          className="mt-3 w-full border border-line rounded-xl py-3 font-semibold text-sm hover:bg-paper-card disabled:opacity-40"
        >
          Reset
        </button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(customerProfile);
  const [editing, setEditing] = useState(false);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.05;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Couldn’t load your profile right now.');
      } else {
        setStatus('ready');
      }
    }, 650);

    return () => clearTimeout(tid);
  }, [loadAttempt]);

  const handleSave = ({ name, location }) => {
    setProfile((p) => ({ ...p, name, location }));
  };

  if (status === 'loading') {
    return (
      <div className="p-5">
        <SkeletonPage />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Profile unavailable"
        subtitle={errorMsg}
        onRetry={() => {
          setStatus('loading');
          setErrorMsg('');
          setLoadAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="No profile data"
        subtitle="Update your details to get started."
        cta={
          <button onClick={() => setEditing(true)} className="mt-4 bg-marigold text-ink px-5 py-3 rounded-lg font-semibold text-sm">
            Edit profile
          </button>
        }
      />
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('profileHeading')}</h2>

      <HelperMini
        name={profile.name}
        initials={profile.initials}
        verified="Phone verified"
        rating={null}
        subline={profile.location}
      />

      <div className="bg-paper-card border border-line rounded-card p-5 shadow-card mb-4">
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('tasksPosted')}</h4>
          <div>{profile.tasksPosted}</div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('ratingGiven')}</h4>
          <div>{profile.avgRatingGiven} ★</div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('memberSince')}</h4>
          <div>{profile.memberSince}</div>
        </div>
        {profile.savedAddresses && profile.savedAddresses.length > 0 && (
          <div className="pt-3">
            <div className="text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">Saved addresses</div>
            {profile.savedAddresses.map((addr) => (
              <div key={addr.label} className="flex gap-2 text-sm mb-1.5">
                <span className="font-semibold text-ink min-w-[46px]">{addr.label}</span>
                <span className="text-ink-soft">{addr.address}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setEditing(true)}
        className="w-full border border-line rounded-lg py-3 font-semibold text-sm hover:bg-paper-card transition-colors"
      >
        {t('editProfile')}
      </button>

      {editing && (
        <EditProfileModal profile={profile} onSave={handleSave} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
