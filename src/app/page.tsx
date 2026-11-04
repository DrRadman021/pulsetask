'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { useApp } from '@/lib/context';
import {
  Calendar,
  Clock,
  Timer,
  Globe,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import AnimatedEmoji, { renderWithAnimatedEmojis } from '@/components/ui/AnimatedEmoji';

export default function LandingPage() {
  const { t, language, setLanguage, dir } = useI18n();
  const { theme, setTheme, user } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive task demo checkbox state
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, text: language === 'fa' ? 'طراحی رابط کاربری فردا ساعت ۱۶' : 'Design dashboard wireframes tomorrow at 4pm', done: false, p: 'p1' },
    { id: 2, text: language === 'fa' ? 'جلسه هماهنگی تیم پنجشنبه 🚀' : 'Team sync review Thursday at 10am 🚀', done: true, p: 'p2' },
    { id: 3, text: language === 'fa' ? 'بررسی مستندات محصول 💡' : 'Review project documentation notes 💡', done: false, p: 'p3' },
  ]);

  const toggleDemoTask = (id: number) => {
    setDemoTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const faqs = [
    {
      q: language === 'fa' ? 'آیا تقویم شمسی به درستی در PulseTask کار می‌کند؟' : 'Does PulseTask support the Jalali (Shamsi) Persian calendar?',
      a: language === 'fa'
        ? 'بله! با تغییر زبان به فارسی، تقویم و تمام تاریخ‌های سررسید به صورت خودکار به تقویم هجری شمسی با ماه‌های فروردین تا اسفند و اعداد فارسی تبدیل می‌شوند.'
        : 'Yes! Switching to Persian immediately converts all calendar grids, task due dates, and digits to the Jalali (Shamsi) calendar format seamlessly with RTL layouts.'
    },
    {
      q: language === 'fa' ? 'تحلیل زبان طبیعی (NLP) چگونه کار می‌کند؟' : 'How does natural language date parsing work?',
      a: language === 'fa'
        ? 'کافی است بنویسید «فردا ساعت ۵ بعد از ظهر p1»؛ پالس‌تسک به شکل بلادرنگ تاریخ، ساعت و اولویت را شناسایی و تنظیم می‌کند.'
        : 'Simply type "tomorrow at 5pm p1" or "next Friday" in your task title, and PulseTask automatically extracts and schedules your task priority and due date.'
    },
    {
      q: language === 'fa' ? 'آیا تایمر پومودورو با نوتیفیکیشن مرورگر یکپارچه است؟' : 'Is the Pomodoro timer integrated with browser notifications?',
      a: language === 'fa'
        ? 'دقیقاً. شما می‌توانید هر کار را به تایمر ۲۵ دقیقه‌ای تمرکز متصل کنید و پس از پایان، پیام صوتی و اعلان مرورگر دریافت نمایید.'
        : 'Absolutely. Connect any task to the 25-minute Pomodoro timer, and receive audio chimes and native browser notifications when sessions wrap up.'
    },
    {
      q: language === 'fa' ? 'آیا نشست کاربری پس از رفرش یا خروج از صفحه حفظ می‌شود؟' : 'Does user session stay persistent for 30 days?',
      a: language === 'fa'
        ? 'بله، پالس‌تسک از کوکی‌های پایدار ۳۰ روزه استفاده می‌کند و حتی با رفرش یا بستن مرورگر لاگین باقی می‌مانید.'
        : 'Yes, PulseTask utilizes secure 30-day persistent sessions, ensuring you never get accidentally logged out when switching pages or reloading.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-red-500/20 selection:text-red-600 transition-colors">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0b0e17]/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size="md" showText={true} />
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span>{language === 'en' ? 'فارسی' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link
                href="/app/today"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all hover:scale-[1.02]"
              >
                <span>{t('landing.dashboard')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                >
                  {t('landing.signIn')}
                </Link>

                <Link
                  href="/app/today"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all hover:scale-[1.02]"
                >
                  <span>{t('landing.getStarted')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(239,68,68,0.12),transparent)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800/60 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'ساده، فوق‌العاده سریع، با تم اختصاصی قرمز' : 'Clean, fast & intuitive productivity'}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              {t('landing.heroTitle')}
            </h1>

            {/* Animated Underline SVG */}
            <div className="flex justify-center mt-3">
              <svg viewBox="0 0 300 12" className="w-48 sm:w-64 md:w-80 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                  d="M2 8 C30 2, 60 10, 100 6 C140 2, 170 10, 210 5 C240 1, 270 9, 298 4"
                  stroke="url(#heroUnderlineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
                />
                <defs>
                  <linearGradient id="heroUnderlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <Link
              href="/app/today"
              className="inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('landing.getStarted')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <span>{t('landing.signIn')}</span>
            </Link>
          </motion.div>

          {/* Interactive Hero Preview Component */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-8 sm:mt-12 max-w-2xl mx-auto bg-white dark:bg-[#131826] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 text-start"
            dir={dir}
          >
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t('nav.today')}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                {language === 'fa' ? 'پیش‌نمایش تعاملی (کلیک کنید)' : 'Interactive Preview (Click to toggle)'}
              </span>
            </div>

            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
              {demoTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleDemoTask(task.id)}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                    task.done
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 opacity-60'
                      : 'bg-white dark:bg-[#161d2e] border-slate-200 dark:border-slate-800 hover:border-red-500/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      task.done
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`flex-1 text-xs font-semibold truncate ${
                      task.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {renderWithAnimatedEmojis(task.text)}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 shrink-0 uppercase">
                    {task.p}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                {language === 'fa' ? 'تشخیص هوشمند تاریخ و اولویت' : 'NLP sets dates & priorities instantly'}
              </span>
              <span>{language === 'fa' ? '۳ کار' : '3 tasks'}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {language === 'fa'
              ? 'امکانات مدرن برای کسانی که می‌خواهند بدون شلوغی و سردرگمی، کارهای روزانه را انجام دهند.'
              : 'Purpose-built features designed to keep your mind clear and your workflow frictionless.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-red-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('landing.feature1Title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.feature1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-red-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('landing.feature2Title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.feature2Desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-red-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('landing.feature3Title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.feature3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('landing.pricingTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t('landing.freeTier')}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{t('landing.freePrice')}</span>
                <span className="text-xs text-slate-400">{language === 'fa' ? 'رایگان برای همیشه' : '/ forever'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('landing.freeDesc')}
              </p>
              <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'وظایف و زیروظایف نامحدود' : 'Unlimited tasks & subtasks'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'پشتیبانی تقویم شمسی و میلادی' : 'Full Jalali & Gregorian calendar'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'تایمر تمرکز پومودورو' : 'Pomodoro focus timer'}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/app/today"
              className="mt-8 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {language === 'fa' ? 'شروع رایگان' : 'Get Started Free'}
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="relative p-8 rounded-2xl bg-white dark:bg-[#131826] border-2 border-red-500 shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider">
              {language === 'fa' ? 'پیشنهادی' : 'Popular'}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t('landing.proTier')}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{t('landing.proPrice')}</span>
                <span className="text-xs text-slate-400">{language === 'fa' ? 'ماهانه' : '/ month'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('landing.proDesc')}
              </p>
              <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'تمام قابلیت‌های پلن رایگان' : 'Everything in Free'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'تکرار خودکار پیشرفته کارها' : 'Recurring tasks automation'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{language === 'fa' ? 'پروژه‌های نامحدود و رنگ‌بندی اختصاصی' : 'Unlimited projects & labels'}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="mt-8 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/30 transition-all hover:scale-[1.01]"
            >
              {language === 'fa' ? 'شروع آزمایش حرفه‌ای' : 'Start Free Trial'}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {language === 'fa' ? 'پرسش‌های متداول' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131826] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-start text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-red-500' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white p-10 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)]" />
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight relative z-10">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl mx-auto relative z-10 leading-relaxed">
            {language === 'fa'
              ? `امروز به ${t('appName')} بپیوندید و آرامش و نظم واقعی را در برنامه‌ریزی روزانه‌تان تجربه کنید.`
              : `Join ${t('appName')} today and experience how refreshing an uncluttered, responsive task manager can be.`}
          </p>
          <div className="pt-2 relative z-10">
            <Link
              href="/app/today"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-white text-red-600 hover:bg-red-50 shadow-lg shadow-black/20 transition-all hover:scale-105"
            >
              <span>{t('landing.ctaButton')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" showText={true} />
          <div>© {new Date().getFullYear()} {t('appName')}. {language === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}</div>
        </div>
      </footer>
    </div>
  );
}
