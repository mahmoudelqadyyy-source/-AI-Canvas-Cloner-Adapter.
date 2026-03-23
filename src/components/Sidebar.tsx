import React from 'react';
import { LayoutDashboard, FileCode2, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { cn } from '@/src/lib/utils';
import { Button } from './ui/button';

export function Sidebar() {
  const { projects, activeProjectId, setActiveProject, deleteProject, theme, toggleTheme } = useStore();

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
        <LayoutDashboard className="w-6 h-6" />
        Canvas Cloner
      </div>

      <div className="p-4">
        <Button 
          className="w-full justify-start gap-2" 
          onClick={() => setActiveProject(null)}
          variant={activeProjectId === null ? "default" : "outline"}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Recent Projects
        </div>
        <div className="space-y-1">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors",
                activeProjectId === project.id
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              onClick={() => setActiveProject(project.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{project.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-500 text-center py-4">
              No projects yet
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </div>
  );
}
