import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useApp();

  if (!toastMessage) return null;

  const { text, type } = toastMessage;

  return (
    <div className="fixed bottom-5 right-5 z-60 max-w-md w-full animate-in slide-in-from-bottom-3 fade-in duration-200">
      <div
        className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 bg-white ${
          type === 'success'
            ? 'border-emerald-300 text-emerald-900 shadow-emerald-500/5'
            : type === 'warning'
            ? 'border-amber-300 text-amber-900 shadow-amber-500/5'
            : type === 'error'
            ? 'border-rose-300 text-rose-900 shadow-rose-500/5'
            : 'border-blue-300 text-blue-900 shadow-blue-500/5'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
          {type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
          {type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
        </div>

        <div className="flex-1 text-xs leading-relaxed text-slate-800 font-sans">
          {text}
        </div>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
