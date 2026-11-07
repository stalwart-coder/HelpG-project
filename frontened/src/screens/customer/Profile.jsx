import { useState, useCallback } from 'react';
import { X, Loader2, ShieldCheck, MapPin, Globe, Moon, LogOut, HelpCircle, Phone, Save, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';

function memberSince(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function CustomerProfile({ onGoSupport }) {
  const { t } = useLanguage();
  const { user, logout, updateProfile, authError } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    const result = await updateProfile({ name: name.trim(), location: location.trim() });
    setSaving(false);
    if (result) {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(authError || 'Failed to save. Please try again.');
    }
  }, [name, location, updateProfile, authError]);

  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Account &amp; Settings
        </h1>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 transition-colors"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck size={16} /> Profile updated successfully.
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xl flex items-center justify-center">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-base text-slate-900 dark:text-white">
                <span>{user?.name || '—'}</span>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-amber-500" />
                <span>{user?.location || user?.phone || '—'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setName(user?.name || ''); setLocation(user?.location || ''); setEditing(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Phone</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">{user?.phone || '—'}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Email</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">{user?.email || '—'}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">Member Since</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{memberSince(user?.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-2">
          Preferences &amp; Language
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Moon size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Appearance Theme</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Choose light, dark, or follow system</div>
            </div>
          </div>
          <ThemeToggle showLabel />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400">
              <Globe size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Preferred Language</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">English, Hindi, Marathi, Gujarati, Bengali</div>
            </div>
          </div>
          <LanguageSelector />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <HelpCircle size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">24x7 Safety &amp; Trust Support</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Aadhaar verified network hotline</div>
            </div>
          </div>
          <a
            href="tel:1800123456"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <Phone size={12} /> Call Helpline
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[480px] bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={14} /> {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  required
                  minLength={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Neighbourhood</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Koramangala 4th Block, Bengaluru"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
