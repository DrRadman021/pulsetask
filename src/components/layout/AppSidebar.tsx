'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Target,
  Settings,
  Plus,
  Globe,
  Sun,
  Moon,
  Trash2,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/jalali';
import BrandLogo from '@/components/ui/BrandLogo';
import AnimatedEmoji, { renderWithAnimatedEmojis } from '@/components/ui/AnimatedEmoji';
import { HALLOWEEN_CONFIG } from '@/lib/halloween';

export default function AppSidebar() {
  const { projects, tasks, user, setQuickAddOpen, createProject, deleteProject, theme, setTheme } = useApp();
  const { t, language, setLanguage, dir } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projColor, setProjColor] = useState('#ef4444');

  // Task Counts
  const todayStr = new Date().toISOString().split('T')[0];
  const inboxCount = tasks.filter((t) => !t.projectId && t.completed === 0).length;
  const todayCount = tasks.filter((t) => (t.dueDate === todayStr || !t.dueDate) && t.completed === 0).length;
  const upcomingCount = tasks.filter((t) => t.dueDate && t.dueDate > todayStr && t.completed === 0).length;

  const formatCount = (n: number) => (language === 'fa' ? toPersianDigits(n) : String(n));

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    const proj = await createProject(projName.trim(), projColor);
    setProjName('');
    setNewProjectModal(false);
    router.push(`/app/projects/${proj.id}`);
  };

  const handleLogout = async () => {
    if (confirm(language === 'fa' ? 'آیا از خروج از حساب کاربری اطمینان دارید؟' : 'Are you sure you want to log out?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (e) {
        window.location.href = '/login';
      }
    }
  };

  const navItems = [
    { href: '/app/inbox', label: t('nav.inbox'), icon: Inbox, count: inboxCount, color: 'text-red-500' },
    { href: '/app/today', label: t('nav.today'), icon: Calendar, count: todayCount, color: 'text-red-600' },
    { href: '/app/upcoming', label: t('nav.upcoming'), icon: CalendarDays, count: upcomingCount, color: 'text-rose-500' },
    { href: '/app/focus', label: t('nav.focus'), icon: Target, count: 0, color: 'text-red-500' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-30">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size="sm" showText={true} />
        </Link>

        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 h-full max-h-full ${
          dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'
        } z-[60] md:z-auto w-72 max-w-[85vw] shrink-0 bg-slate-50 dark:bg-[#0e121d] border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-200 select-none ${
          mobileOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="flex items-center">
              <BrandLogo size="md" showText={true} />
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {HALLOWEEN_CONFIG.isHalloween && (
              <AnimatedEmoji className="text-xs" title="Spooky Season">
                🕸️
              </AnimatedEmoji>
            )}

            <button
              onClick={() => setQuickAddOpen(true)}
              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/30 transition-transform active:scale-95"
              title={language === 'fa' ? 'افزودن کار (Q)' : 'Add Task (Q)'}
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 md:hidden"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Profile Info */}
        <div className="px-4 py-2.5 bg-slate-100/50 dark:bg-[#131929]/50 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between shrink-0 overflow-hidden">
          <div className="min-w-0 flex-1 truncate">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
              {user?.name || ''}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {user?.email || ''}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors shrink-0 ms-2"
            title={t('nav.logOut')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Views */}
        <div className="p-3 space-y-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold border border-red-200/50 dark:border-red-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {formatCount(item.count)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Projects Section */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{t('nav.projects')}</span>
            <button
              onClick={() => setNewProjectModal(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title={language === 'fa' ? 'افزودن پروژه' : 'Add Project'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {projects.map((proj) => {
              const isActive = pathname === `/app/projects/${proj.id}`;
              const count = tasks.filter((t) => t.projectId === proj.id && t.completed === 0).length;

              return (
                <div
                  key={proj.id}
                  className="group/proj flex items-center justify-between rounded-xl transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                >
                  <Link
                    href={`/app/projects/${proj.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium truncate ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: proj.color || '#ef4444' }}
                    />
                    <span className="truncate">{renderWithAnimatedEmojis(t(proj.name))}</span>
                  </Link>

                  <div className="flex items-center gap-1.5 pr-2">
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {formatCount(count)}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(proj.id);
                      }}
                      className="opacity-0 group-hover/proj:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                      title={language === 'fa' ? 'حذف پروژه' : 'Delete Project'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Language Switcher, Theme & Settings */}
        <div className="mt-auto shrink-0 w-full overflow-hidden p-3 bg-slate-50 dark:bg-[#0e121d] border-t border-slate-200/60 dark:border-slate-800/60 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-red-500 transition-colors"
              title={language === 'fa' ? 'تغییر زبان' : 'Toggle Language'}
            >
              <Globe className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{language === 'en' ? 'فارسی' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="shrink-0 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={language === 'fa' ? 'تغییر پوسته' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Settings Link */}
            <Link
              href="/app/settings"
              onClick={() => setMobileOpen(false)}
              className="shrink-0 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={t('nav.settings')}
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir={dir}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              {language === 'fa' ? 'افزودن پروژه جدید' : 'Add New Project'}
            </h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'fa' ? 'نام پروژه' : 'Project Name'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={language === 'fa' ? 'مثال: طراحی محصول، کار، ورزش' : 'e.g. Design System, Fitness, Work'}
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {language === 'fa' ? 'رنگ شاخص' : 'Color Tag'}
                </label>
                <div className="flex gap-2">
                  {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setProjColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        projColor === c ? 'scale-125 ring-2 ring-red-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {t('tasks.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/30"
                >
                  {language === 'fa' ? 'ایجاد پروژه' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
