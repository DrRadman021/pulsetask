'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  Calendar,
  Flag,
  Trash2,
  Check,
  Plus,
  X,
  ListTree,
  Repeat,
  Tag,
  Folder,
  AlignLeft,
  Clock,
} from 'lucide-react';
import { Subtask, Task } from '@/lib/services';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import ColorTagPicker from '@/components/ui/ColorTagPicker';

export default function TaskDetailDrawer() {
  const { activeTaskDetail, setActiveTaskDetail, updateTask, deleteTask, projects } = useApp();
  const { t, language, dir } = useI18n();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [colorTag, setColorTag] = useState<string>('#ef4444');
  const [projectId, setProjectId] = useState<string>('');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTaskDetail) {
      setTitle(activeTaskDetail.title);
      setDescription(activeTaskDetail.description || '');
      setPriority(activeTaskDetail.priority || 'p4');
      setDueDate(activeTaskDetail.dueDate || null);
      setColorTag(activeTaskDetail.colorTag || '#ef4444');
      setProjectId(activeTaskDetail.projectId || '');
      setRecurring(activeTaskDetail.recurring || 'none');
      setSubtasks(activeTaskDetail.subtasks || []);
    }
  }, [activeTaskDetail]);

  if (!activeTaskDetail) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTask(activeTaskDetail.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        colorTag,
        projectId: projectId || null,
        recurring,
      });
      setActiveTaskDetail(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(language === 'fa' ? 'آیا از حذف این کار اطمینان دارید؟' : 'Are you sure you want to delete this task?')) {
      await deleteTask(activeTaskDetail.id);
      setActiveTaskDetail(null);
    }
  };

  const handleToggleSubtask = async (sub: Subtask) => {
    const nextCompleted = sub.completed === 1 ? 0 : 1;
    setSubtasks((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, completed: nextCompleted } : s))
    );

    try {
      await fetch(`/api/subtasks/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${activeTaskDetail.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });

      if (res.ok) {
        const created: Subtask = await res.json();
        setSubtasks((prev) => [...prev, created]);
        setNewSubtaskTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubtask = async (subId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId));
    try {
      await fetch(`/api/subtasks/${subId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  // Priority options
  const priorityOptions: SelectOption[] = [
    { value: 'p1', label: t('priorities.p1'), color: '#ef4444' },
    { value: 'p2', label: t('priorities.p2'), color: '#f97316' },
    { value: 'p3', label: t('priorities.p3'), color: '#3b82f6' },
    { value: 'p4', label: t('priorities.p4'), color: '#94a3b8' },
  ];

  // Project options
  const projectOptions: SelectOption[] = [
    { value: '', label: language === 'fa' ? 'صندوق ورودی (عمومی)' : 'Inbox (General)', color: '#ef4444' },
    ...projects.map((p) => ({
      value: p.id,
      label: t(p.name),
      color: p.color || '#ef4444',
    })),
  ];

  // Recurrence options
  const recurringOptions: SelectOption[] = [
    { value: 'none', label: t('tasks.recurring.none') },
    { value: 'daily', label: t('tasks.recurring.daily') },
    { value: 'weekly', label: t('tasks.recurring.weekly') },
    { value: 'monthly', label: t('tasks.recurring.monthly') },
  ];

  // Drawer slide animation direction based on LTR/RTL
  const slideInitial = dir === 'rtl' ? { x: '-100%' } : { x: '100%' };
  const slideExit = dir === 'rtl' ? { x: '-100%' } : { x: '100%' };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm overflow-hidden"
        style={{ justifyContent: dir === 'rtl' ? 'flex-start' : 'flex-end' }}
        onClick={() => setActiveTaskDetail(null)}
        dir={dir}
      >
        <motion.div
          initial={slideInitial}
          animate={{ x: 0 }}
          exit={slideExit}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="w-full max-w-md h-full bg-white dark:bg-[#111624] border-l dark:border-slate-800 shadow-2xl flex flex-col overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Actions */}
          <div className="sticky top-0 z-10 px-6 py-4 bg-white/90 dark:bg-[#111624]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('tasks.taskDetails')}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title={t('tasks.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTaskDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={language === 'fa' ? 'بستن' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('tasks.titlePlaceholder')}
                className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-red-500 pb-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Core Properties Grid */}
            <div className="space-y-3.5 bg-slate-50/70 dark:bg-[#161d2e] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              {/* Due Date */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('tasks.dueDate')}
                </span>
                <CustomDatePicker value={dueDate} onChange={setDueDate} />
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'fa' ? 'اولویت' : 'Priority'}
                </span>
                <div className="w-44">
                  <CustomSelect
                    value={priority}
                    onChange={(v) => setPriority(v as any)}
                    options={priorityOptions}
                  />
                </div>
              </div>

              {/* Color Tag */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('tasks.colorTag')}
                </span>
                <ColorTagPicker value={colorTag} onChange={setColorTag} />
              </div>

              {/* Project Assignment */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('tasks.selectProject')}
                </span>
                <div className="w-44">
                  <CustomSelect
                    value={projectId}
                    onChange={setProjectId}
                    options={projectOptions}
                  />
                </div>
              </div>

              {/* Recurring Schedule */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'fa' ? 'تکرار' : 'Repeat'}
                </span>
                <div className="w-44">
                  <CustomSelect
                    value={recurring}
                    onChange={(v) => setRecurring(v as any)}
                    options={recurringOptions}
                  />
                </div>
              </div>
            </div>

            {/* Description Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'fa' ? 'توضیحات و یادداشت‌ها' : 'Description & Notes'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('tasks.descriptionPlaceholder')}
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#171f33] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Subtasks Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('tasks.subtasks')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {subtasks.filter((s) => s.completed === 1).length} / {subtasks.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#151c2e]"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        sub.completed === 1
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {sub.completed === 1 && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <span
                      className={`flex-1 text-xs font-medium ${
                        sub.completed === 1
                          ? 'line-through text-slate-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {sub.title}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder={t('tasks.addSubtask')}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#171f33] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Save Action */}
          <div className="sticky bottom-0 p-4 bg-white/95 dark:bg-[#111624]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTaskDetail(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('tasks.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('tasks.update')
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
