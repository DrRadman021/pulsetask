'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useI18n } from '@/lib/i18n/context';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#0b0e17] flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-slate-100">
      <div className="mb-6">
        <BrandLogo size="lg" showText={true} />
      </div>

      <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">404</span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        The task view or page you requested could not be found.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/app/today"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <span>Open {t('appName')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
