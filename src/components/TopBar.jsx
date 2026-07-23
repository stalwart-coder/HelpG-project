import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar({ mode, setMode, onExit }) {
  const { t } = useLanguage();
  return (
    <div className="sticky top-0 z-50 bg-ink text-white px-5 pt-4 pb-3.5 rounded-b-[20px] shadow-[0_4px_20px_rgba(27,35,64,0.12)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          disabled={!onExit}
          className={`text-left ${onExit ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
          aria-label="Return to landing page"
        >
          <div className="text-[22px] font-bold font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-marigold inline-block" />
            HelpJi
          </div>
          <div className="text-[11px] text-indigo-200/80 mt-0.5 font-mono tracking-wide">
            // {t('tagline')}
          </div>
        </button>
        <LanguageSwitcher />
      </div>

      <div className="flex bg-white/10 rounded-full p-1 mt-4 relative">
        <div className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-marigold shadow-card transition-transform duration-300 ${mode === 'customer' ? 'translate-x-0' : 'translate-x-full'}`} />
        <button
          onClick={() => setMode('customer')}
          className={`flex-1 py-2.5 px-2 rounded-full text-[13px] font-semibold transition-all duration-200 relative z-10 ${
            mode === 'customer' ? 'text-ink' : 'text-indigo-200 hover:text-white'
          }`}
        >
          🙋 {t('modeCustomer')}
        </button>
        <button
          onClick={() => setMode('helper')}
          className={`flex-1 py-2.5 px-2 rounded-full text-[13px] font-semibold transition-all duration-200 relative z-10 ${
            mode === 'helper' ? 'text-ink' : 'text-indigo-200 hover:text-white'
          }`}
        >
          🛠️ {t('modeHelper')}
        </button>
      </div>
    </div>
  );
}
