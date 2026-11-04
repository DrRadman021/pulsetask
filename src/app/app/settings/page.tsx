'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  Settings,
  User,
  Globe,
  Palette,
  Bell,
  Sun,
  Moon,
  Laptop,
  Check,
  Command,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user, theme, setTheme, addToast, logout } = useApp();
  const { t, language, setLanguage, dir } = useI18n();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(t('settings.savedSuccess'), 'success');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleEnableNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setNotificationStatus(res);
      if (res === 'granted') {
        new Notification('PulseTask Notifications Enabled!', {
          body: 'You will receive reminders for due dates and focus intervals.',
          icon: '/logo-red.png'
        });
        addToast('Notifications enabled successfully', 'success');
      } else {
        addToast('Notification permission was denied', 'error');
      }
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 select-none" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Language & Direction Section */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.language')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {language === 'fa'
              ? 'تغییر زبان به فارسی فوراً جهت صفحه را راست‌به‌چپ (RTL)، فونت را به وزیرمتن و تقویم را به شمسی تغییر می‌دهد.'
              : 'Switching language automatically toggles RTL layout, Persian Vazirmatn font, and the Jalali calendar.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{t('settings.english')}</span>
              {language === 'en' && <Check className="w-4 h-4 text-red-500" />}
            </button>

            <button
              onClick={() => setLanguage('fa')}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                language === 'fa'
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{t('settings.persian')}</span>
              {language === 'fa' && <Check className="w-4 h-4 text-red-500" />}
            </button>
          </div>
        </div>

        {/* Appearance Theme */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.theme')}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>{t('settings.light')}</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>{t('settings.dark')}</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'system'
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span>{t('settings.system')}</span>
            </button>
          </div>
        </div>

        {/* Browser Notifications */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings.notifications')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {t('settings.enableNotifications')}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEnableNotifications}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25'
              }`}
            >
              {notificationStatus === 'granted'
                ? language === 'fa' ? 'اعلان‌ها فعال هستند' : 'Notifications Active'
                : language === 'fa' ? 'درخواست فعال‌سازی اعلان‌ها' : 'Request Notification Permission'}
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {language === 'fa' ? 'پروفایل کاربری' : 'User Profile'}
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#182032] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#151c2c] text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all"
            >
              {t('settings.saveChanges')}
            </button>
          </form>
        </div>

        {/* Account & Session Management */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'fa' ? 'حساب کاربری و خروج' : 'Account & Session'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'fa'
                  ? 'نشست فعال شما تا ۳۰ روز معتبر است. برای خاتمه نشست خارج شوید.'
                  : 'Your session is securely persistent for 30 days. Click below to sign out.'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? (language === 'fa' ? 'در حال خروج...' : 'Signing out...') : language === 'fa' ? 'خروج از حساب' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Command className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {language === 'fa' ? 'کلیدهای میانبر کیبورد' : 'Keyboard Shortcuts'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300">
                {language === 'fa' ? 'افزودن سریع کار' : 'Quick Add Task'}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] font-bold">
                Q
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300">
                {language === 'fa' ? 'پالت فرمان و جستجو' : 'Command Palette'}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] font-bold">
                Ctrl/⌘ + K
              </kbd>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300">
                {language === 'fa' ? 'بستن پنجره‌ها' : 'Close Modals'}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] font-bold">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
