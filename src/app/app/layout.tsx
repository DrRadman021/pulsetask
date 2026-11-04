import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { HalloweenPumpkin } from '@/components/ui/HalloweenDecoration';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row flex-1 h-full min-h-0 w-full overflow-hidden bg-slate-50 dark:bg-[#0c0f17]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {children}
        <HalloweenPumpkin />
      </div>
    </div>
  );
}
