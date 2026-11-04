'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import TaskList from '@/components/tasks/TaskList';
import { Folder, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toPersianDigits } from '@/lib/jalali';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();

  const { projects, tasks, setQuickAddOpen, deleteProject } = useApp();
  const { t, language, dir } = useI18n();
  const [deleting, setDeleting] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const pendingCount = projectTasks.filter((t) => t.completed === 0).length;

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
          {language === 'fa' ? 'پروژه یافت نشد' : 'Project not found'}
        </h2>
        <button
          onClick={() => router.push('/app/today')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
        >
          {language === 'fa' ? 'بازگشت به وظایف امروز' : 'Back to Today'}
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (
      !confirm(
        language === 'fa'
          ? `آیا از حذف پروژه "${t(project.name)}" اطمینان دارید؟`
          : `Are you sure you want to delete project "${t(project.name)}"?`
      )
    ) {
      return;
    }

    setDeleting(true);
    await deleteProject(project.id);
    router.push('/app/today');
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 select-none" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: project.color || '#ef4444' }}
          >
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t(project.name)}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'fa'
                ? `${toPersianDigits(pendingCount)} کار باقی‌مانده`
                : `${pendingCount} tasks remaining`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('tasks.save')}</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 dark:hover:border-rose-900/50 transition-colors"
            title={language === 'fa' ? 'حذف پروژه' : 'Delete Project'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={projectTasks}
        emptyMessage={
          language === 'fa'
            ? 'هیچ کاری برای این پروژه ثبت نشده است.'
            : 'No tasks found in this project yet.'
        }
        allowReorder={true}
      />
    </div>
  );
}
