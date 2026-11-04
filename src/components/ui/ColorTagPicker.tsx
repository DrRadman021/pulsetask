'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export const COLOR_TAGS = [
  { label: 'Red', color: '#ef4444' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Amber', color: '#f59e0b' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Cyan', color: '#06b6d4' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Pink', color: '#ec4899' },
];

interface ColorTagPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export default function ColorTagPicker({ value, onChange, className = '' }: ColorTagPickerProps) {
  const { language, dir } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentColor = value || '#ef4444';

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#131826] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
        title="Pick color tag"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: currentColor }}
        />
        <span>{language === 'fa' ? 'برچسب رنگی' : 'Color Tag'}</span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-1.5 w-44 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#141b2c]/95 backdrop-blur-md shadow-2xl p-2.5"
            style={{ [dir === 'rtl' ? 'right' : 'left']: 0 }}
          >
            <div className="grid grid-cols-4 gap-2">
              {COLOR_TAGS.map((tag) => (
                <button
                  key={tag.color}
                  type="button"
                  onClick={() => {
                    onChange(tag.color);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                  style={{ backgroundColor: tag.color }}
                  title={tag.label}
                >
                  {currentColor === tag.color && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
