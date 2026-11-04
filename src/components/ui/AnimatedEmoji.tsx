'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedEmojiProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function AnimatedEmoji({ children, className = '', title }: AnimatedEmojiProps) {
  return (
    <motion.span
      title={title}
      className={`inline-block cursor-default select-none ${className}`}
      whileHover={{
        scale: 1.35,
        rotate: [0, -12, 12, -8, 8, 0],
        transition: { duration: 0.45, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
}

// Utility function to detect and wrap emojis in a text string
const EMOJI_REGEX = /(\p{Extended_Pictographic})/gu;

export function renderWithAnimatedEmojis(text: string) {
  if (!text) return null;
  const parts = text.split(EMOJI_REGEX);
  return parts.map((part, index) => {
    if (EMOJI_REGEX.test(part)) {
      return (
        <AnimatedEmoji key={index} className="mx-0.5">
          {part}
        </AnimatedEmoji>
      );
    }
    return part;
  });
}

export default AnimatedEmoji;
