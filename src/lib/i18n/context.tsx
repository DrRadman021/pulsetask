'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import fa from './fa.json';

export type Language = 'en' | 'fa';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  language: Language;
  dir: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, any> = { en, fa };

const I18nContext = createContext<I18nContextType | null>(null);

export const ONBOARDING_TRANSLATIONS: Record<string, { en: string; fa: string }> = {
  // Projects
  "🚀 Getting Started with PulseTask": {
    en: "🚀 Getting Started with PulseTask",
    fa: "🚀 شروع کار با پالس تسک"
  },
  "💡 Personal Life & Errands": {
    en: "💡 Personal Life & Errands",
    fa: "💡 زندگی شخصی و کارها"
  },
  "🎃 Halloween Preparation": {
    en: "🎃 Halloween Preparation",
    fa: "🎃 آماده‌سازی هالووین"
  },

  // Project 1 Tasks
  "Welcome to PulseTask! 👋": {
    en: "Welcome to PulseTask! 👋",
    fa: "به پالس تسک خوش آمدید! 👋"
  },
  "Add your first task": {
    en: "Add your first task",
    fa: "اولین تسک خود را اضافه کنید"
  },
  "Organize with Projects & Labels": {
    en: "Organize with Projects & Labels",
    fa: "سازماندهی با پروژه‌ها و برچسب‌ها"
  },
  "Stay focused with the Pomodoro Timer": {
    en: "Stay focused with the Pomodoro Timer",
    fa: "با تایمر پومودورو متمرکز بمانید"
  },
  "Switch to Dark Mode 🌙": {
    en: "Switch to Dark Mode 🌙",
    fa: "به حالت تاریک بروید 🌙"
  },

  // Project 2 Tasks
  "Buy groceries 🛒": {
    en: "Buy groceries 🛒",
    fa: "خرید مواد غذایی 🛒"
  },
  "Schedule dentist appointment": {
    en: "Schedule dentist appointment",
    fa: "رزرو نوبت دندانپزشکی"
  },
  "Read a book for 30 minutes": {
    en: "Read a book for 30 minutes",
    fa: "۳۰ دقیقه کتاب بخوانید"
  },

  // Project 3 Tasks
  "Buy Halloween costume": {
    en: "Buy Halloween costume",
    fa: "خرید لباس هالووین"
  },
  "Decorate the house with pumpkins": {
    en: "Decorate the house with pumpkins",
    fa: "تزئین خانه با کدو تنبل"
  },
  "Prepare spooky playlist": {
    en: "Prepare spooky playlist",
    fa: "آماده‌سازی پلی‌لیست ترسناک 🎵"
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsetask_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
      if (lang === 'fa') {
        document.documentElement.classList.add('font-vazir');
      } else {
        document.documentElement.classList.remove('font-vazir');
      }
    }
  };

  useEffect(() => {
    const saved =
      (localStorage.getItem('pulsetask_lang') as Language) ||
      (localStorage.getItem('zentask_lang') as Language) ||
      'en';
    setLanguage(saved);
  }, []);

  const t = (key: string): string => {
    if (!key) return '';

    // Direct match in onboarding dictionary
    if (ONBOARDING_TRANSLATIONS[key]) {
      return ONBOARDING_TRANSLATIONS[key][language] || ONBOARDING_TRANSLATIONS[key]['en'] || key;
    }
    // Reverse match (if key is already in Persian or English)
    for (const val of Object.values(ONBOARDING_TRANSLATIONS)) {
      if (val.fa === key || val.en === key) {
        return val[language] || key;
      }
    }

    const keys = key.split('.');
    let current: any = translations[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback: any = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) fallback = fallback[fk];
          else return key;
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof current === 'string' ? current : key;
  };

  const dir: Direction = language === 'fa' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
