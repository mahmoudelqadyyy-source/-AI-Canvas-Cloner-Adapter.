import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GenerationStatus = 'Idle' | 'Analyzing' | 'Generating' | 'Completed' | 'Error';

export interface UIProject {
  id: string;
  title: string;
  referenceImage: string; // Base64
  similarityScore: number; // 0 to 100
  generatedCode: string;
  status: GenerationStatus;
  createdAt: string;
  error?: string;
}

interface AppState {
  projects: UIProject[];
  activeProjectId: string | null;
  theme: 'light' | 'dark';
  addProject: (project: UIProject) => void;
  updateProject: (id: string, updates: Partial<UIProject>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      theme: 'light',
      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id,
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'ai-canvas-storage',
    }
  )
);
