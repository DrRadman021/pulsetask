'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#0b0e17] flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        {error.message || 'An unexpected error occurred while rendering this page.'}
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
