'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/today');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] text-xs text-slate-400">
      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2" />
      <span>Loading tasks...</span>
    </div>
  );
}
