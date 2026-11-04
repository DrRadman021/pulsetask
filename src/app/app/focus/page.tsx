'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n/context';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Bell,
  Sparkles,
  Coffee,
  Volume2
} from 'lucide-react';
import { toPersianDigits } from '@/lib/jalali';
import confetti from 'canvas-confetti';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

export default function FocusPomodoroPage() {
  const { tasks, addToast } = useApp();
  const { t, language, dir } = useI18n();

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission if needed
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  // Sound chime synthesizer
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId]);

  const handleSessionComplete = async () => {
    playChime();

    // Trigger confetti
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f87171', '#dc2626', '#f59e0b', '#10b981']
      });
    } catch (e) {}

    // Send Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'work' ? 'PulseTask Focus Session Done!' : 'Break Over!', {
        body: mode === 'work' ? t('focus.sessionCompleted') : 'Time to get back to work!',
        icon: '/favicon.ico'
      });
    }

    if (mode === 'work') {
      setCompletedSessions((prev) => prev + 1);
      addToast(t('focus.sessionCompleted'), 'success');

      // Log session to backend database
      try {
        await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: selectedTaskId || null,
            durationMinutes: 25,
            notes: 'Completed 25-minute Pomodoro focus block'
          })
        });
      } catch (err) {
        console.error(err);
      }

      // Switch to break
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      addToast('Break complete! Ready for next session.', 'info');
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    requestNotificationPermission();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const displayTimer = language === 'fa' ? toPersianDigits(timeFormatted) : timeFormatted;

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const uncompletedTasks = tasks.filter((t) => t.completed === 0);

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 select-none" dir={dir}>
      {/* Header */}
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 mb-2">
          <Timer className="w-4 h-4" />
          <span>{t('focus.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {mode === 'work'
            ? language === 'fa' ? 'حالت تمرکز عمیق (۲۵ دقیقه)' : 'Deep Work Session'
            : language === 'fa' ? 'زمان استراحت کوتاه (۵ دقیقه)' : 'Short Rest Interval'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t('focus.subtitle')}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => switchMode('work')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'work'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'تمرکز (۲۵ دقیقه)' : 'Focus (25m)'}</span>
        </button>

        <button
          onClick={() => switchMode('break')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'break'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'استراحت (۵ دقیقه)' : 'Break (5m)'}</span>
        </button>
      </div>

      {/* Main Timer Display Card */}
      <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Progress Background Accent */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1.5 transition-all duration-1000 ${
            mode === 'work' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Big Digit Countdown */}
        <div className="text-6xl sm:text-8xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums my-4">
          {displayTimer}
        </div>

        {/* Task Link Selector */}
        <div className="w-full max-w-sm mt-4 mb-8">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 text-center">
            {t('focus.selectTask')}
          </label>
          <CustomSelect
            value={selectedTaskId}
            onChange={setSelectedTaskId}
            disabled={isRunning}
            options={[
              {
                value: '',
                label: language === 'fa' ? '-- تمرکز کلی بدون کار خاص --' : '-- General Focus Session --',
              },
              ...uncompletedTasks.map((task) => ({
                value: task.id,
                label: t(task.title),
                color: task.colorTag || '#ef4444',
              })),
            ]}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${
              mode === 'work'
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>{t('focus.pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{t('focus.start')}</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('focus.reset')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Completed Today Counter */}
      <div className="mt-8 flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-100 dark:bg-[#121624] border border-slate-200/80 dark:border-slate-800/80 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {t('focus.completedSessions')}
        </span>
        <div className="flex items-center gap-2 font-bold text-red-500">
          <Sparkles className="w-4 h-4" />
          <span>
            {language === 'fa' ? toPersianDigits(completedSessions) : completedSessions}{' '}
            {language === 'fa' ? 'بخش' : 'sessions'}
          </span>
        </div>
      </div>
    </div>
  );
}
