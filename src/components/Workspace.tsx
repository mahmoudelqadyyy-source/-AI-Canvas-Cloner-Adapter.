import React, { useState } from 'react';
import { useStore, UIProject } from '@/src/store/useStore';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { UploadCloud, Wand2, AlertCircle } from 'lucide-react';
import { generateCodeFromImage } from '@/src/services/aiService';

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15);
  }
};

export function Workspace() {
  const { activeProjectId, projects, addProject, updateProject } = useStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const [dragActive, setDragActive] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [similarity, setSimilarity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalImage(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    const imageToUse = activeProject ? activeProject.referenceImage : localImage;
    if (!imageToUse) return;

    setIsGenerating(true);
    setProgress(10);
    setError(null);

    let projectId = activeProjectId;

    if (!projectId) {
      const newProject: UIProject = {
        id: generateId(),
        title: `Project ${projects.length + 1}`,
        referenceImage: imageToUse,
        similarityScore: similarity,
        generatedCode: '',
        status: 'Analyzing',
        createdAt: new Date().toISOString(),
      };
      addProject(newProject);
      projectId = newProject.id;
    } else {
      updateProject(projectId, { status: 'Analyzing', similarityScore: similarity });
    }

    try {
      setProgress(40);
      
      const code = await generateCodeFromImage(imageToUse, similarity);
      
      setProgress(100);
      updateProject(projectId, {
        generatedCode: code,
        status: 'Completed',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate code.');
      updateProject(projectId, { status: 'Error', error: err.message });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getSimilarityLabel = (val: number) => {
    if (val <= 30) return "Total Remake (Structure Only)";
    if (val <= 70) return "Balanced Remix (Modernize)";
    return "Pixel Perfect (Clone)";
  };

  const displayImage = activeProject ? activeProject.referenceImage : localImage;
  const currentSimilarity = activeProject ? activeProject.similarityScore : similarity;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {activeProject ? activeProject.title : 'New Project'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Upload a dashboard screenshot and transform it into a functional React component.
          </p>
        </div>

        {/* Upload Area */}
        {!displayImage ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Drag & drop your screenshot</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">PNG, JPG, WEBP up to 5MB</p>
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Browse Files
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group">
            <img src={displayImage} alt="Reference" className="w-full h-auto max-h-[400px] object-contain" />
            {!activeProject && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" onClick={() => setLocalImage(null)}>
                  Change Image
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Similarity Control</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getSimilarityLabel(currentSimilarity)}
                </p>
              </div>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentSimilarity}%</span>
            </div>
            <Slider
              value={[currentSimilarity]}
              onValueChange={(vals) => {
                if (!activeProject) setSimilarity(vals[0]);
                else updateProject(activeProject.id, { similarityScore: vals[0] });
              }}
              max={100}
              step={1}
              disabled={!!activeProject && activeProject.status === 'Generating'}
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              <span>Remake</span>
              <span>Remix</span>
              <span>Clone</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              className="w-full h-12 text-lg gap-2" 
              onClick={handleGenerate}
              disabled={!displayImage || isGenerating || (activeProject?.status === 'Generating')}
            >
              <Wand2 className="w-5 h-5" />
              {isGenerating ? 'Generating Code...' : 'Generate React Code'}
            </Button>
            
            {(isGenerating || progress > 0) && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>{progress < 50 ? 'Analyzing Image...' : 'Writing Code...'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
