'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HALLOWEEN_CONFIG } from '@/lib/halloween';
import { useI18n } from '@/lib/i18n/context';

export function HalloweenBanner() {
  const { language } = useI18n();

  if (!HALLOWEEN_CONFIG.isHalloween || !HALLOWEEN_CONFIG.banner.enabled) {
    return null;
  }

  const message = language === 'fa' ? HALLOWEEN_CONFIG.banner.fa : HALLOWEEN_CONFIG.banner.en;

  return (
    <div
      className="w-full bg-gradient-to-r from-orange-600/20 via-red-600/25 to-amber-600/20 border-b border-orange-500/30 py-2 px-4 text-center text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center justify-center gap-2 select-none relative z-20 shrink-0"
    >
      <span>{message}</span>
    </div>
  );
}

export function HalloweenPumpkin() {
  const { dir } = useI18n();

  if (!HALLOWEEN_CONFIG.isHalloween) return null;

  const leftPosition = dir === 'rtl' ? 'left-4 sm:left-6' : 'left-4 sm:left-6 md:left-[19.5rem]';

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 ${leftPosition} z-20 pointer-events-none select-none transition-all duration-300`}
      aria-hidden="true"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2.5, -2.5, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center"
      >
        <svg
          viewBox="0 0 100 95"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-[0_8px_16px_rgba(234,88,12,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#40916c" />
              <stop offset="100%" stopColor="#1b4332" />
            </linearGradient>
            <radialGradient id="centerLobe" cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="#ff7b00" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
            <radialGradient id="midLobe" cx="45%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#fb8500" />
              <stop offset="75%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            <radialGradient id="outerLobe" cx="40%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f77f00" />
              <stop offset="80%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>
            <filter id="jackGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Stem */}
          <path
            d="M50 24 C49 13 56 6 65 4 C63 8 59 14 55 24 Z"
            fill="url(#stemGrad)"
            stroke="#1b4332"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Curly vine tendril */}
          <path
            d="M55 18 C61 14 66 16 64 21 C62 25 57 23 59 20"
            stroke="#74c69d"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />

          {/* Pumpkin Lobes */}
          {/* Far Outer Left */}
          <ellipse cx="28" cy="56" rx="17" ry="23" fill="url(#outerLobe)" />
          {/* Far Outer Right */}
          <ellipse cx="72" cy="56" rx="17" ry="23" fill="url(#outerLobe)" />
          {/* Mid Left */}
          <ellipse cx="38" cy="57" rx="16" ry="26" fill="url(#midLobe)" />
          {/* Mid Right */}
          <ellipse cx="62" cy="57" rx="16" ry="26" fill="url(#midLobe)" />
          {/* Center Lobe */}
          <ellipse cx="50" cy="58" rx="15" ry="27" fill="url(#centerLobe)" />

          {/* Rib highlights for 3D depth */}
          <path
            d="M38 34 C30 42 28 66 38 78"
            stroke="#ffedd5"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M50 31 C46 42 46 68 50 82"
            stroke="#ffedd5"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Jack-o'-Lantern Carved Face */}
          {/* Left Eye */}
          <polygon
            points="34,45 44,52 32,54"
            fill="#ffea00"
            stroke="#d97706"
            strokeWidth="0.75"
            filter="url(#jackGlow)"
          />
          {/* Right Eye */}
          <polygon
            points="66,45 68,54 56,52"
            fill="#ffea00"
            stroke="#d97706"
            strokeWidth="0.75"
            filter="url(#jackGlow)"
          />
          {/* Nose */}
          <polygon
            points="50,52 54,59 46,59"
            fill="#ffea00"
            stroke="#d97706"
            strokeWidth="0.75"
            filter="url(#jackGlow)"
          />
          {/* Grin / Smile */}
          <path
            d="M28 64 Q50 82 72 64 Q66 72 61 67 Q56 75 50 69 Q44 75 39 67 Q34 72 28 64 Z"
            fill="#ffea00"
            stroke="#d97706"
            strokeWidth="0.75"
            filter="url(#jackGlow)"
          />
        </svg>

        {/* Dynamic drop shadow */}
        <motion.div
          animate={{
            scale: [1, 0.8, 1],
            opacity: [0.35, 0.2, 0.35],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 sm:w-20 h-2.5 sm:h-3 bg-black/40 dark:bg-black/60 rounded-full blur-[3px] -mt-1"
        />
      </motion.div>
    </div>
  );
}

export function HalloweenBackground() {
  if (!HALLOWEEN_CONFIG.isHalloween) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {HALLOWEEN_CONFIG.floatingElements.map((el, idx) => (
        <motion.div
          key={idx}
          className="absolute opacity-10 dark:opacity-15 grayscale hover:grayscale-0 transition-opacity"
          style={{ left: el.x, top: el.y, fontSize: el.size }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 4, -4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  );
}
