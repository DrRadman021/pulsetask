'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useApp } from '@/lib/context';
import {
  gregorianToJalali,
  jalaliToGregorian,
  JALALI_MONTH_NAMES,
  toPersianDigits,
  getJalaliMonthDays,
} from '@/lib/jalali';

interface MiniCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  className?: string;
}

export default function MiniCalendar({
  selectedDate,
  onSelectDate,
  className = '',
}: MiniCalendarProps) {
  const { language, dir } = useI18n();
  const { tasks } = useApp();
  const isFa = language === 'fa';

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const jToday = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [viewJy, setViewJy] = useState(jToday.jy);
  const [viewJm, setViewJm] = useState(jToday.jm);

  const [viewGy, setViewGy] = useState(today.getFullYear());
  const [viewGm, setViewGm] = useState(today.getMonth());

  const handlePrevMonth = () => {
    if (isFa) {
      if (viewJm === 1) {
        setViewJy(viewJy - 1);
        setViewJm(12);
      } else {
        setViewJm(viewJm - 1);
      }
    } else {
      if (viewGm === 0) {
        setViewGy(viewGy - 1);
        setViewGm(11);
      } else {
        setViewGm(viewGm - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (isFa) {
      if (viewJm === 12) {
        setViewJy(viewJy + 1);
        setViewJm(1);
      } else {
        setViewJm(viewJm + 1);
      }
    } else {
      if (viewGm === 11) {
        setViewGy(viewGy + 1);
        setViewGm(0);
      } else {
        setViewGm(viewGm + 1);
      }
    }
  };

  const handleJumpToToday = () => {
    if (isFa) {
      setViewJy(jToday.jy);
      setViewJm(jToday.jm);
    } else {
      setViewGy(today.getFullYear());
      setViewGm(today.getMonth());
    }
    onSelectDate(todayStr);
  };

  interface DayCell {
    dayNum: number;
    dateStr: string;
    isCurrentMonth: boolean;
    taskCount: number;
  }

  const cells: DayCell[] = [];
  const weekDays = isFa ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (isFa) {
    const totalDays = getJalaliMonthDays(viewJy, viewJm);
    const firstDayG = jalaliToGregorian(viewJy, viewJm, 1);
    const firstDateObj = new Date(firstDayG.gy, firstDayG.gm - 1, firstDayG.gd);
    const startWeekDay = (firstDateObj.getDay() + 1) % 7;

    for (let i = 0; i < startWeekDay; i++) {
      cells.push({ dayNum: 0, dateStr: '', isCurrentMonth: false, taskCount: 0 });
    }
    for (let d = 1; d <= totalDays; d++) {
      const g = jalaliToGregorian(viewJy, viewJm, d);
      const ds = `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
      const count = tasks.filter((t) => t.dueDate === ds && t.completed === 0).length;
      cells.push({ dayNum: d, dateStr: ds, isCurrentMonth: true, taskCount: count });
    }
  } else {
    const firstDayObj = new Date(viewGy, viewGm, 1);
    const startWeekDay = firstDayObj.getDay();
    const totalDays = new Date(viewGy, viewGm + 1, 0).getDate();

    for (let i = 0; i < startWeekDay; i++) {
      cells.push({ dayNum: 0, dateStr: '', isCurrentMonth: false, taskCount: 0 });
    }
    for (let d = 1; d <= totalDays; d++) {
      const ds = `${viewGy}-${pad(viewGm + 1)}-${pad(d)}`;
      const count = tasks.filter((t) => t.dueDate === ds && t.completed === 0).length;
      cells.push({ dayNum: d, dateStr: ds, isCurrentMonth: true, taskCount: count });
    }
  }

  const headerTitle = isFa
    ? `${JALALI_MONTH_NAMES[viewJm - 1]} ${toPersianDigits(viewJy)}`
    : new Date(viewGy, viewGm).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div
      className={`bg-white dark:bg-[#131826] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm select-none ${className}`}
      dir={dir}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {headerTitle}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFa ? 'امروز' : 'Today'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dir === 'rtl' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
        {weekDays.map((wd, i) => (
          <div key={i}>{wd}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={idx} className="h-7 w-7" />;
          }

          const isSelected = selectedDate === cell.dateStr;
          const isTodayDate = cell.dateStr === todayStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : cell.dateStr)}
              className={`relative h-7 w-7 mx-auto rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : isTodayDate
                  ? 'border border-red-500 text-red-500 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isFa ? toPersianDigits(cell.dayNum) : cell.dayNum}</span>

              {/* Task Indicator Dot */}
              {cell.taskCount > 0 && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                    isSelected ? 'bg-white' : 'bg-red-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Status Badge */}
      {selectedDate && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">
            {isFa ? 'فیلتر تاریخ فعال است' : 'Date filter active'}
          </span>
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="font-bold text-red-500 hover:underline"
          >
            {isFa ? 'نمایش همه' : 'Show all'}
          </button>
        </div>
      )}
    </div>
  );
}
