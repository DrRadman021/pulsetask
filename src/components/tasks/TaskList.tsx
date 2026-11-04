'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/services';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  Check,
  Calendar,
  Clock,
  ListTree,
  Trash2,
  GripVertical,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { formatJalaliDate, toPersianDigits } from '@/lib/jalali';
import { motion, AnimatePresence } from 'framer-motion';
import { renderWithAnimatedEmojis } from '@/components/ui/AnimatedEmoji';
import { HALLOWEEN_CONFIG } from '@/lib/halloween';

export default function TaskList({
  tasks,
  emptyMessage,
  allowReorder = true,
}: {
  tasks: Task[];
  emptyMessage?: string;
  allowReorder?: boolean;
}) {
  const { toggleTask, deleteTask, setActiveTaskDetail } = useApp();
  const { language, t } = useI18n();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    if (language === 'fa') {
      return formatJalaliDate(dateStr);
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr: string | null, completed: number) => {
    if (!dateStr || completed === 1) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const getPriorityClasses = (p: string) => {
    switch (p) {
      case 'p1':
        return 'border-red-500 text-red-500 bg-red-500/10';
      case 'p2':
        return 'border-orange-500 text-orange-500 bg-orange-500/10';
      case 'p3':
        return 'border-blue-500 text-blue-500 bg-blue-500/10';
      default:
        return 'border-slate-300 dark:border-slate-700 text-slate-400';
    }
  };

  const handleDragStart = (id: string) => {
    if (!allowReorder) return;
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!allowReorder) return;
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!allowReorder || !draggedId || draggedId === targetId) return;

    const sourceIndex = tasks.findIndex((t) => t.id === draggedId);
    const targetIndex = tasks.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setDraggedId(null);

    try {
      await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (tasks.length === 0) {
    const isHalloween = HALLOWEEN_CONFIG.isHalloween;
    const spookyMsg = language === 'fa' ? HALLOWEEN_CONFIG.emptyStates.todayFa : HALLOWEEN_CONFIG.emptyStates.todayEn;

    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
          {isHalloween ? (
            <span className="text-2xl">{HALLOWEEN_CONFIG.emptyStates.todayEn.includes('👻') ? '👻' : '🎃'}</span>
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-sm">
          {isHalloween ? spookyMsg : emptyMessage || t('tasks.emptyInbox')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-2">
      <AnimatePresence initial={false}>
        {tasks.map((task, idx) => {
          const completedSubtasks = task.subtasks?.filter((s) => s.completed === 1).length || 0;
          const totalSubtasks = task.subtasks?.length || 0;
          const overdue = isOverdue(task.dueDate, task.completed);
          const pClasses = getPriorityClasses(task.priority);

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              draggable={allowReorder}
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(task.id)}
              onClick={() => setActiveTaskDetail(task)}
              className={`group flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-900/60 cursor-pointer transition-all ${
                task.completed === 1 ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Drag Handle */}
                {allowReorder && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 cursor-grab text-slate-300 dark:text-slate-700 hover:text-slate-500 p-0.5 mt-0.5 shrink-0 transition-opacity"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Checkbox Circle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform active:scale-80 shrink-0 ${pClasses} ${
                    task.completed === 1 ? 'bg-red-500 border-red-500 text-white' : ''
                  }`}
                  aria-label="Toggle task completion"
                >
                  {task.completed === 1 && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Task Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {/* Color Tag Dot */}
                    {task.colorTag && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: task.colorTag }}
                        title="Custom Color Tag"
                      />
                    )}

                    <span
                      className={`text-xs sm:text-sm font-semibold truncate leading-tight transition-all ${
                        task.completed === 1
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {renderWithAnimatedEmojis(t(task.title))}
                    </span>
                  </div>

                  {/* Description Excerpt */}
                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {t(task.description)}
                    </p>
                  )}

                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                    {/* Due Date */}
                    {task.dueDate && (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          overdue ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{formatDueDate(task.dueDate)}</span>
                        {task.dueTime && <span>{language === 'fa' ? toPersianDigits(task.dueTime) : task.dueTime}</span>}
                      </span>
                    )}

                    {/* Recurring Badge */}
                    {task.recurring && task.recurring !== 'none' && (
                      <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                        <Repeat className="w-3 h-3" />
                        <span className="capitalize">{t(`tasks.recurring.${task.recurring}`)}</span>
                      </span>
                    )}

                    {/* Subtasks Count */}
                    {totalSubtasks > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <ListTree className="w-3 h-3" />
                        <span>
                          {language === 'fa'
                            ? `${toPersianDigits(completedSubtasks)}/${toPersianDigits(totalSubtasks)}`
                            : `${completedSubtasks}/${totalSubtasks}`}
                        </span>
                      </span>
                    )}

                    {/* Project Tag */}
                    {task.projectName && (
                      <span
                        className="font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${task.projectColor || '#ef4444'}15`,
                          color: task.projectColor || '#ef4444',
                        }}
                      >
                        {t(task.projectName)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action: Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                title={t('tasks.delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
