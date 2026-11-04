'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  text?: string;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
  text,
}: BrandLogoProps) {
  const { t } = useI18n();
  const displayName = text || t('appName') || 'PulseTask';
  let imgDimensions = 34;
  let containerSize = 'w-10 h-10';
  let textSize = 'text-lg';
  let gap = 'gap-2';

  if (size === 'sm') {
    imgDimensions = 26;
    containerSize = 'w-7 h-7';
    textSize = 'text-sm';
    gap = 'gap-1.5';
  } else if (size === 'lg') {
    imgDimensions = 44;
    containerSize = 'w-12 h-12';
    textSize = 'text-2xl';
    gap = 'gap-2.5';
  }

  return (
    <div className={`flex items-center ${gap} group select-none ${className}`}>
      {/* 
        Logo container:
        Has a crisp white rounded background with subtle border and shadow in both modes
        so the white background of logo-red.png blends seamlessly without hard cutoffs.
      */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative ${containerSize} flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <Image
          src="/logo-red.png"
          alt={`${displayName} Logo`}
          width={imgDimensions}
          height={imgDimensions}
          className="object-cover w-full h-full scale-110 drop-shadow-sm"
          priority
        />
      </motion.div>

      {showText && (
        <span
          className={`font-black tracking-tight ${textSize} bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-600 to-red-500 dark:from-red-400 dark:via-rose-300 dark:to-red-400`}
        >
          {displayName}
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
