'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  Calendar as CalendarIcon,
  Flag,
  Folder,
  Repeat,
  Plus,
  X,
  Sparkles,
  Check,
  Tag,
  AlignLeft,
  ListTodo,
} from 'lucide-react';
import { parseNaturalLanguageTask } from '@/lib/nlp';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import ColorTagPicker from '@/components/ui/ColorTagPicker';

export default function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen, createTask, projects } = useApp();
  const { t, language, dir } = useI18n();

  const [inputTitle, setInputTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p4');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [colorTag, setColorTag] = useState<string>('#ef4444');
  const [projectId, setProjectId] = useState<string>('');
  const [recurring, setRecurring] = useState<string>('none');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setInputTitle('');
      setDescription('');
      setShowDescription(false);
      setPriority('p4');
      setDueDate(null);
      setColorTag('#ef4444');
      setProjectId('');
      setRecurring('none');
      setSubtasks([]);
      setNewSubtask('');
      setShowSubtasks(false);
    }
  }, [quickAddOpen]);

  // Live NLP parsing
  const nlpPreview = parseNaturalLanguageTask(inputTitle);

  // Sync NLP results when detected
  useEffect(() => {
    if (nlpPreview.dueDate && !dueDate) {
      setDueDate(nlpPreview.dueDate);
    }
    if (nlpPreview.priority && nlpPreview.priority !== 'p4' && priority === 'p4') {
      setPriority(nlpPreview.priority);
    }
    if (nlpPreview.recurring !== 'none' && recurring === 'none') {
      setRecurring(nlpPreview.recurring);
    }
  }, [nlpPreview.dueDate, nlpPreview.priority, nlpPreview.recurring]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    setLoading(true);
    try {
      await createTask({
        title: inputTitle.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        colorTag,
        projectId: projectId || null,
        recurring: recurring as any,
        subtasks,
      });
      setQuickAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!quickAddOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setQuickAddOpen(false)}
        dir={dir}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Header with Title & Close button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('nav.quickAdd')}
              </span>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Title Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder={t('tasks.titlePlaceholder')}
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
            />

            {/* NLP Live Preview Badge */}
            {inputTitle && (nlpPreview.dueDate || nlpPreview.priority !== 'p4') && (
              <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-[11px] text-red-600 dark:text-red-400">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'fa' ? 'تشخیص هوشمند: ' : 'NLP Detected: '}
                  {nlpPreview.dueDate && <strong>{nlpPreview.dueDate} </strong>}
                  {nlpPreview.priority !== 'p4' && <strong>({nlpPreview.priority.toUpperCase()}) </strong>}
                </span>
              </div>
            )}

            {/* Description toggle & textarea */}
            {showDescription ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('tasks.descriptionPlaceholder')}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#171f33] text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? '+ افزودن توضیحات / یادداشت' : '+ Add description / notes'}</span>
              </button>
            )}

            {/* Subtasks Checklist Builder */}
            {showSubtasks ? (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161d2f] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{t('tasks.subtasks')}</span>
                  <span className="text-[10px] text-slate-400">({subtasks.length})</span>
                </div>
                {subtasks.map((st, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-700 dark:text-slate-200">• {st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder={t('tasks.addSubtask')}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2236] text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubtasks(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors block"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? '+ افزودن زیروظایف' : '+ Add subtasks'}</span>
              </button>
            )}

            {/* Customization Controls Toolbar (All available right here in creation view!) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
              {/* Due Date Picker */}
              <CustomDatePicker value={dueDate} onChange={setDueDate} />

              {/* Priority Select */}
              <div className="w-36">
                <CustomSelect
                  value={priority}
                  onChange={(v) => setPriority(v as any)}
                  options={priorityOptions}
                  placeholder={t('priorities.p4')}
                />
              </div>

              {/* Color Tag Picker */}
              <ColorTagPicker value={colorTag} onChange={setColorTag} />

              {/* Project Select */}
              <div className="w-36">
                <CustomSelect
                  value={projectId}
                  onChange={setProjectId}
                  options={projectOptions}
                  placeholder={t('tasks.selectProject')}
                />
              </div>

              {/* Recurrence Select */}
              <div className="w-32">
                <CustomSelect
                  value={recurring}
                  onChange={setRecurring}
                  options={recurringOptions}
                  placeholder={language === 'fa' ? 'تکرار' : 'Repeat'}
                />
              </div>
            </div>

            {/* Actions: Cancel & Submit */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {language === 'fa' ? 'Enter برای ثبت، Esc برای انصراف' : 'Press Enter to save, Esc to exit'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('tasks.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading || !inputTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('tasks.save')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
