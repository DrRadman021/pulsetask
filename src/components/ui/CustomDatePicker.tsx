'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import {
  gregorianToJalali,
  jalaliToGregorian,
  JALALI_MONTH_NAMES,
  toPersianDigits,
  getJalaliMonthDays,
  formatJalaliDate,
} from '@/lib/jalali';

interface CustomDatePickerProps {
  value: string | null; // YYYY-MM-DD
  onChange: (val: string | null) => void;
  className?: string;
}

export default function CustomDatePicker({ value, onChange, className = '' }: CustomDatePickerProps) {
  const { language, dir } = useI18n();
  const isFa = language === 'fa';

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Current view year & month
  const jToday = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [viewJy, setViewJy] = useState(jToday.jy);
  const [viewJm, setViewJm] = useState(jToday.jm);

  const [viewGy, setViewGy] = useState(today.getFullYear());
  const [viewGm, setViewGm] = useState(today.getMonth());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

  const handleQuickSelect = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Generate days
  interface DayItem {
    dayNum: number;
    dateStr: string;
    isCurrentMonth: boolean;
  }
  const days: DayItem[] = [];
  const weekDays = isFa ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (isFa) {
    const totalDays = getJalaliMonthDays(viewJy, viewJm);
    const firstDayG = jalaliToGregorian(viewJy, viewJm, 1);
    const firstDateObj = new Date(firstDayG.gy, firstDayG.gm - 1, firstDayG.gd);
    const startWeekDay = (firstDateObj.getDay() + 1) % 7;

    for (let i = 0; i < startWeekDay; i++) {
      days.push({ dayNum: 0, dateStr: '', isCurrentMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const g = jalaliToGregorian(viewJy, viewJm, d);
      const ds = `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
      days.push({ dayNum: d, dateStr: ds, isCurrentMonth: true });
    }
  } else {
    const firstDayObj = new Date(viewGy, viewGm, 1);
    const startWeekDay = firstDayObj.getDay();
    const totalDays = new Date(viewGy, viewGm + 1, 0).getDate();

    for (let i = 0; i < startWeekDay; i++) {
      days.push({ dayNum: 0, dateStr: '', isCurrentMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const ds = `${viewGy}-${pad(viewGm + 1)}-${pad(d)}`;
      days.push({ dayNum: d, dateStr: ds, isCurrentMonth: true });
    }
  }

  const formatButtonDisplay = () => {
    if (!value) return isFa ? 'تاریخ سررسید' : 'Due date';
    if (value === todayStr) return isFa ? 'امروز' : 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    if (value === tomorrowStr) return isFa ? 'فردا' : 'Tomorrow';

    if (isFa) return formatJalaliDate(value);
    const d = new Date(value);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const headerMonthTitle = isFa
    ? `${JALALI_MONTH_NAMES[viewJm - 1]} ${toPersianDigits(viewJy)}`
    : new Date(viewGy, viewGm).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          value
            ? 'border-red-500/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#131826] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <span>{formatButtonDisplay()}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="p-0.5 rounded-full hover:bg-red-200/50 dark:hover:bg-red-900/50 text-red-500"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-1.5 w-64 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#141b2c]/95 backdrop-blur-md shadow-2xl p-3"
            style={{ [dir === 'rtl' ? 'right' : 'left']: 0 }}
          >
            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="py-1 px-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-slate-700 dark:text-slate-300 transition-colors text-center"
              >
                {isFa ? 'امروز' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="py-1 px-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-slate-700 dark:text-slate-300 transition-colors text-center"
              >
                {isFa ? 'فردا' : 'Tomorrow'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(7)}
                className="py-1 px-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-slate-700 dark:text-slate-300 transition-colors text-center"
              >
                {isFa ? '+۷ روز' : '+7 Days'}
              </button>
            </div>

            {/* Month Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {dir === 'rtl' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {headerMonthTitle}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
              {weekDays.map((wd, i) => (
                <div key={i}>{wd}</div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={idx} className="h-7" />;
                }
                const isSelected = value === item.dateStr;
                const isTodayDate = item.dateStr === todayStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(item.dateStr);
                      setIsOpen(false);
                    }}
                    className={`h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/30'
                        : isTodayDate
                        ? 'border border-red-500/40 text-red-500 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isFa ? toPersianDigits(item.dayNum) : item.dayNum}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
