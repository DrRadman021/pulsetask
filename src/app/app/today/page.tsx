'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import TaskList from '@/components/tasks/TaskList';
import MiniCalendar from '@/components/tasks/MiniCalendar';
import { Calendar, Plus, Filter, RotateCcw } from 'lucide-react';
import { formatJalaliDate, toPersianDigits } from '@/lib/jalali';
import { motion } from 'framer-motion';

export default function TodayPage() {
  const { tasks, setQuickAddOpen } = useApp();
  const { t, language, dir } = useI18n();

  const todayStr = new Date().toISOString().split('T')[0];
  const [calendarDateFilter, setCalendarDateFilter] = useState<string | null>(null);

  // If a specific date is clicked in MiniCalendar, filter by that date
  // Otherwise show tasks due today (or overdue / active)
  let displayTasks = tasks;

  if (calendarDateFilter) {
    displayTasks = tasks.filter((task) => task.dueDate === calendarDateFilter);
  } else {
    const todayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate <= todayStr;
    });

    displayTasks = todayTasks.length > 0
      ? todayTasks
      : tasks.filter((t) => t.completed === 0).slice(0, 6);
  }

  const pendingCount = displayTasks.filter((t) => t.completed === 0).length;

  const todayDisplay = language === 'fa'
    ? formatJalaliDate(calendarDateFilter || todayStr)
    : new Date(calendarDateFilter || todayStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 select-none" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {calendarDateFilter ? (language === 'fa' ? 'وظایف برگزیده' : 'Selected Date') : t('nav.today')}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                {todayDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'fa'
                ? `${toPersianDigits(pendingCount)} کار برنامه‌ریزی شده`
                : `${pendingCount} tasks scheduled`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('tasks.save')}</span>
        </button>
      </div>

      {/* Side-by-Side Split View: Main Task List + Side Mini-Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Task List Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {calendarDateFilter && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151c2e] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {language === 'fa'
                  ? `فیلتر بر اساس تاریخ: ${formatJalaliDate(calendarDateFilter)}`
                  : `Filtering by: ${calendarDateFilter}`}
              </span>
              <button
                type="button"
                onClick={() => setCalendarDateFilter(null)}
                className="text-red-500 font-bold hover:underline"
              >
                {language === 'fa' ? 'بازگشت به وظایف امروز' : 'Reset to Today'}
              </button>
            </div>
          )}

          <TaskList
            tasks={displayTasks}
            emptyMessage={t('tasks.emptyToday')}
            allowReorder={true}
          />
        </div>

        {/* Side Mini-Calendar (4 cols on lg screens, stacks cleanly below on mobile) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            {language === 'fa' ? 'تقویم هوشمند روزانه' : 'Schedule Navigator'}
          </div>
          <MiniCalendar
            selectedDate={calendarDateFilter}
            onSelectDate={setCalendarDateFilter}
          />
        </div>
      </div>
    </div>
  );
}
