import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { PreviewArea } from './components/PreviewArea';
import { useStore } from './store/useStore';

export default function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-50">
      <Sidebar />
      <Workspace />
      <PreviewArea />
    </div>
  );
}
