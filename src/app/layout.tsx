import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { AppProvider } from '@/lib/context';
import ToastContainer from '@/components/ui/ToastContainer';
import CommandPalette from '@/components/ui/CommandPalette';
import QuickAddModal from '@/components/tasks/QuickAddModal';
import TaskDetailDrawer from '@/components/tasks/TaskDetailDrawer';
import { HalloweenBanner, HalloweenBackground } from '@/components/ui/HalloweenDecoration';

export const metadata: Metadata = {
  title: 'PulseTask — Fast, Intuitive Task & Productivity Management',
  description: 'A beautifully simple, lightning-fast task management app with natural language parsing, Jalali & Gregorian calendars, Pomodoro focus mode, and bilingual support.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-red.png',
    shortcut: '/logo-red.png',
    apple: '/logo-red.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo-red.png" />
        <link rel="apple-touch-icon" href="/logo-red.png" />
        <meta name="theme-color" content="#ef4444" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-[#f8fafc] dark:bg-[#0b0e17] text-[#0f172a] dark:text-[#f8fafc] min-h-screen selection:bg-red-500/20 selection:text-red-500 relative flex flex-col">
        <I18nProvider>
          <AppProvider>
            <HalloweenBackground />
            <HalloweenBanner />
            {children}
            <ToastContainer />
            <CommandPalette />
            <QuickAddModal />
            <TaskDetailDrawer />
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
