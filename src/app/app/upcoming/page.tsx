'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  gregorianToJalali,
  jalaliToGregorian,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  toPersianDigits,
  getJalaliMonthDays,
  formatJalaliDate
} from '@/lib/jalali';
import { Task } from '@/lib/services';
import TaskList from '@/components/tasks/TaskList';

export default function UpcomingCalendarPage() {
  const { tasks, setActiveTaskDetail, setQuickAddOpen } = useApp();
  const { t, language, dir } = useI18n();

  const isFa = language === 'fa';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calendar State
  // For Persian, track current Jy and Jm (1-12)
  const currentJalaliToday = gregorianToJalali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  const [currentJy, setCurrentJy] = useState(currentJalaliToday.jy);
  const [currentJm, setCurrentJm] = useState(currentJalaliToday.jm);

  // For Gregorian, track current Gy and Gm (0-11)
  const [currentGy, setCurrentGy] = useState(today.getFullYear());
  const [currentGm, setCurrentGm] = useState(today.getMonth());

  // Selected date filter
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (isFa) {
      if (currentJm === 1) {
        setCurrentJy(currentJy - 1);
        setCurrentJm(12);
      } else {
        setCurrentJm(currentJm - 1);
      }
    } else {
      if (currentGm === 0) {
        setCurrentGy(currentGy - 1);
        setCurrentGm(11);
      } else {
        setCurrentGm(currentGm - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (isFa) {
      if (currentJm === 12) {
        setCurrentJy(currentJy + 1);
        setCurrentJm(1);
      } else {
        setCurrentJm(currentJm + 1);
      }
    } else {
      if (currentGm === 11) {
        setCurrentGy(currentGy + 1);
        setCurrentGm(0);
      } else {
        setCurrentGm(currentGm + 1);
      }
    }
  };

  const handleJumpToToday = () => {
    if (isFa) {
      setCurrentJy(currentJalaliToday.jy);
      setCurrentJm(currentJalaliToday.jm);
    } else {
      setCurrentGy(today.getFullYear());
      setCurrentGm(today.getMonth());
    }
    setSelectedDate(todayStr);
  };

  // Build Calendar Days Matrix
  interface DayCell {
    dayNum: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: Task[];
  }

  const cells: DayCell[] = [];
  const weekDays = isFa
    ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isFa) {
    // Jalali Month generation
    const totalDays = getJalaliMonthDays(currentJy, currentJm);
    // Find weekday of 1st day of month
    // In Persian calendar, week starts on Shanbeh (Saturday)
    // In JS getDay(): 0 is Sunday, 1 is Monday, ... 6 is Saturday
    // So Shanbeh (Sat) is index 0 in Persian: (gregorianDay + 1) % 7
    const firstDayGregorian = jalaliToGregorian(currentJy, currentJm, 1);
    const firstDateObj = new Date(
      firstDayGregorian.gy,
      firstDayGregorian.gm - 1,
      firstDayGregorian.gd
    );
    const startWeekDay = (firstDateObj.getDay() + 1) % 7; // 0 for Sat, 1 for Sun...

    // Empty cells before month start
    for (let i = 0; i < startWeekDay; i++) {
      cells.push({
        dayNum: 0,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        tasks: []
      });
    }

    // Days in current Jalali month
    for (let d = 1; d <= totalDays; d++) {
      const g = jalaliToGregorian(currentJy, currentJm, d);
      const mm = String(g.gm).padStart(2, '0');
      const dd = String(g.gd).padStart(2, '0');
      const dateStr = `${g.gy}-${mm}-${dd}`;
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: dayTasks
      });
    }
  } else {
    // Gregorian Month generation
    const firstDayObj = new Date(currentGy, currentGm, 1);
    const startWeekDay = firstDayObj.getDay(); // 0 is Sun
    const totalDays = new Date(currentGy, currentGm + 1, 0).getDate();

    for (let i = 0; i < startWeekDay; i++) {
      cells.push({
        dayNum: 0,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        tasks: []
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const mm = String(currentGm + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${currentGy}-${mm}-${dd}`;
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: dayTasks
      });
    }
  }

  // Selected date tasks
  const selectedDateTasks = selectedDate
    ? tasks.filter((t) => t.dueDate === selectedDate)
    : tasks.filter((t) => t.dueDate && t.dueDate >= todayStr);

  const selectedDateFormatted = selectedDate
    ? isFa
      ? formatJalaliDate(selectedDate)
      : new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })
    : '';

  const headerMonthTitle = isFa
    ? `${JALALI_MONTH_NAMES[currentJm - 1]} ${toPersianDigits(currentJy)}`
    : new Date(currentGy, currentGm).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 select-none" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('nav.upcoming')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFa
                ? 'تقویم هوشمند شمسی با نمایش وظایف زمان‌بندی شده'
                : 'Interactive calendar view showing scheduled deadlines'}
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('nav.today')}
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-28 text-center">
              {headerMonthTitle}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tasks.save')}</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#101420]">
          {weekDays.map((wd, i) => (
            <div
              key={i}
              className="py-2.5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
          {cells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={idx}
                  className="min-h-20 sm:min-h-24 p-2 bg-slate-50/30 dark:bg-slate-900/20 opacity-30 cursor-default"
                />
              );
            }

            const isSelected = selectedDate === cell.dateStr;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`min-h-20 sm:min-h-24 p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-50/70 dark:bg-red-950/30 ring-2 ring-red-500/80 ring-inset'
                    : 'hover:bg-slate-50 dark:hover:bg-[#171e30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      cell.isToday
                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/40'
                        : isSelected
                        ? 'text-red-500 font-extrabold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isFa ? toPersianDigits(cell.dayNum) : cell.dayNum}
                  </span>

                  {cell.tasks.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-500">
                      {isFa ? toPersianDigits(cell.tasks.length) : cell.tasks.length}
                    </span>
                  )}
                </div>

                {/* Task preview dots / badges in cell */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {cell.tasks.slice(0, 2).map((taskItem) => (
                    <div
                      key={taskItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskDetail(taskItem);
                      }}
                      className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                        taskItem.completed === 1
                          ? 'line-through text-slate-400 bg-slate-100 dark:bg-slate-800'
                          : taskItem.priority === 'p1'
                          ? 'bg-red-500/10 text-red-500'
                          : taskItem.priority === 'p2'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {t(taskItem.title)}
                    </div>
                  ))}
                  {cell.tasks.length > 2 && (
                    <div className="text-[9px] text-slate-400 font-semibold px-1">
                      {isFa
                        ? `+${toPersianDigits(cell.tasks.length - 2)} کار دیگر`
                        : `+${cell.tasks.length - 2} more`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {selectedDateFormatted || t('nav.upcoming')}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {isFa
              ? `${toPersianDigits(selectedDateTasks.length)} کار زمان‌بندی شده`
              : `${selectedDateTasks.length} tasks scheduled`}
          </span>
        </div>

        <TaskList
          tasks={selectedDateTasks}
          emptyMessage={t('tasks.emptyUpcoming')}
          allowReorder={false}
        />
      </div>
    </div>
  );
}
