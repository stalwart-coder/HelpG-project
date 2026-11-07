import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun size={15} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon size={15} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System Default"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Monitor size={15} />
      </button>
      {showLabel && (
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 ml-1.5 mr-2 capitalize">
          {resolvedTheme}
        </span>
      )}
    </div>
  );
}
