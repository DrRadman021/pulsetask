'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  CheckCircle2, 
  Inbox, 
  Calendar, 
  Clock, 
  Timer, 
  Settings, 
  Plus, 
  Folder, 
  X,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette() {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    tasks, 
    projects, 
    setActiveTaskDetail, 
    createTask 
  } = useApp();
  const { t, dir, language } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Build navigation items
  const navItems = [
    { id: 'nav-inbox', type: 'nav', title: t('nav.inbox'), icon: Inbox, url: '/app/inbox' },
    { id: 'nav-today', type: 'nav', title: t('nav.today'), icon: Calendar, url: '/app/today' },
    { id: 'nav-upcoming', type: 'nav', title: t('nav.upcoming'), icon: Clock, url: '/app/upcoming' },
    { id: 'nav-focus', type: 'nav', title: t('focus.title'), icon: Timer, url: '/app/focus' },
    { id: 'nav-settings', type: 'nav', title: t('settings.title'), icon: Settings, url: '/app/settings' },
  ];

  // Project items
  const projectItems = projects.map((p) => ({
    id: `project-${p.id}`,
    type: 'project',
    title: p.name,
    icon: Folder,
    color: p.color,
    url: `/app/projects/${p.id}`,
  }));

  // Filter tasks matching query
  const q = query.trim().toLowerCase();
  const filteredTasks = q
    ? tasks.filter((task) => task.title.toLowerCase().includes(q)).slice(0, 8)
    : [];

  const filteredNav = q
    ? navItems.filter((item) => item.title.toLowerCase().includes(q))
    : navItems;

  const filteredProjects = q
    ? projectItems.filter((item) => item.title.toLowerCase().includes(q))
    : projectItems.slice(0, 4);

  // Grouped active items list for keyboard arrow navigation
  const allItems: any[] = [];

  if (q) {
    allItems.push({
      id: 'create-action',
      type: 'action',
      title: `${t('nav.quickAdd')}: "${query.trim()}"`,
      icon: Plus,
      action: async () => {
        await createTask({ title: query.trim() });
        setCommandPaletteOpen(false);
      }
    });
  }

  filteredTasks.forEach((task) => {
    allItems.push({
      id: `task-${task.id}`,
      type: 'task',
      title: t(task.title),
      task,
      icon: CheckCircle2,
      action: () => {
        setCommandPaletteOpen(false);
        setActiveTaskDetail(task);
      }
    });
  });

  filteredNav.forEach((item) => {
    allItems.push({
      id: item.id,
      type: 'nav',
      title: item.title,
      icon: item.icon,
      action: () => {
        setCommandPaletteOpen(false);
        router.push(item.url);
      }
    });
  });

  filteredProjects.forEach((p) => {
    allItems.push({
      id: p.id,
      type: 'project',
      title: t(p.title),
      icon: p.icon,
      color: p.color,
      action: () => {
        setCommandPaletteOpen(false);
        router.push(p.url);
      }
    });
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev + 1) % allItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev - 1 + allItems.length) % allItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      dir={dir}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={language === 'fa' ? 'دستور را تایپ کنید یا تسک‌ها را جستجو کنید...' : 'Type a command or search tasks...'}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {language === 'fa' ? 'نتیجه‌ای یافت نشد' : 'No results found'}
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-start text-xs transition-colors ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon 
                      className="w-4 h-4 shrink-0" 
                      style={item.color ? { color: item.color } : undefined} 
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.type === 'task' && (
                    <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-wider">
                      {language === 'fa' ? 'وظیفه' : 'Task'}
                    </span>
                  )}
                  {item.type === 'nav' && (
                    <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-wider">
                      {language === 'fa' ? 'رفتن به' : 'Jump to'}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0f1420] text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↑↓</kbd> {language === 'fa' ? 'پیمایش' : 'navigate'}</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↵</kbd> {language === 'fa' ? 'انتخاب' : 'select'}</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">esc</kbd> {language === 'fa' ? 'بستن' : 'close'}</span>
          </div>
          <span className="font-bold text-red-500">{t('appName')}</span>
        </div>
      </div>
    </div>
  );
}
