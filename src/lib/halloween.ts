/**
 * PulseTask Isolated Halloween Feature Configuration
 * Toggle `isHalloween: false` to instantly disable all Halloween effects globally.
 */

export const HALLOWEEN_CONFIG = {
  // Master switch to turn off or on all Halloween touches
  isHalloween: true,

  banner: {
    enabled: true,
    en: 'Happy Halloween! 🎃 Organize your work with frighteningly good focus.',
    fa: 'هالووین مبارک! 🎃 کارهایتان را با تمرکز فوق‌العاده و جادویی پیش ببرید.',
  },

  emptyStates: {
    todayEn: 'No tasks left today... even the ghosts are resting! 👻',
    todayFa: 'هیچ کاری باقی نمانده... حتی ارواح هم در حال استراحتند! 👻',
    inboxEn: 'Your inbox is clear! Spooky peace of mind achieved. 🎃',
    inboxFa: 'صندوق ورودی شما خالی است! آرامش جادویی برقرار شد. 🎃',
    upcomingEn: 'No scheduled deadlines looming in the shadows. 🕸️',
    upcomingFa: 'هیچ کار زمان‌بندی‌شده‌ای در تاریکی پنهان نشده است. 🕸️',
  },

  profileBadge: {
    emoji: '🕸️',
    tooltip: 'Spooky season mode active',
  },

  // Subtle floating background elements (rendered with low opacity)
  floatingElements: [
    { emoji: '🎃', x: '8%', y: '12%', size: '1.2rem', delay: 0 },
    { emoji: '👻', x: '92%', y: '25%', size: '1.1rem', delay: 2 },
    { emoji: '🦇', x: '85%', y: '75%', size: '1.3rem', delay: 4 },
    { emoji: '🕸️', x: '4%', y: '80%', size: '1.4rem', delay: 1 },
  ]
};
