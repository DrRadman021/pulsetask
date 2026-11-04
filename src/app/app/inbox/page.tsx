'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import TaskList from '@/components/tasks/TaskList';
import { Inbox, Plus } from 'lucide-react';
import { toPersianDigits } from '@/lib/jalali';

export default function InboxPage() {
  const { tasks, setQuickAddOpen } = useApp();
  const { t, language, dir } = useI18n();

  // Tasks in inbox: no project assigned
  const inboxTasks = tasks.filter((t) => !t.projectId);
  const pendingCount = inboxTasks.filter((t) => t.completed === 0).length;

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 select-none" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('nav.inbox')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'fa'
                ? `${toPersianDigits(pendingCount)} کار در انتظار`
                : `${pendingCount} pending tasks`}
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

      {/* Task List */}
      <TaskList
        tasks={inboxTasks}
        emptyMessage={t('tasks.emptyInbox')}
        allowReorder={true}
      />
    </div>
  );
}
