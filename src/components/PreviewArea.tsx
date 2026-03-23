import React, { useState } from 'react';
import { useStore } from '@/src/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import * as LucideIcons from 'lucide-react';
import { Copy, Download, Code2, MonitorPlay } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { LiveProvider, LiveError, LivePreview } from 'react-live';

export function PreviewArea() {
  const { activeProjectId, projects } = useStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const [copied, setCopied] = useState(false);

  if (!activeProject || !activeProject.generatedCode) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
        <MonitorPlay className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Live Preview Sandbox</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Upload an image and generate code to see the live preview and source code here.
        </p>
      </div>
    );
  }

  const getFullCode = () => {
    const code = activeProject.generatedCode;
    const hasReactImport = code.includes('import React');
    const hasLucideImport = code.includes('lucide-react');
    
    let imports = '';
    if (!hasReactImport) imports += 'import React from "react";\n';
    
    // Naively extract used lucide icons to create an import statement
    const usedIcons = Object.keys(LucideIcons).filter(icon => 
      code.includes(`<${icon}`) || code.includes(` ${icon} `) || code.includes(`${icon},`)
    );
    
    if (usedIcons.length > 0 && !hasLucideImport) {
      imports += `import { ${usedIcons.join(', ')} } from "lucide-react";\n`;
    }
    
    // Add default export if missing
    let finalCode = code;
    if (!code.includes('export default')) {
      finalCode = finalCode.replace('function GeneratedComponent', 'export default function GeneratedComponent');
    }
    
    return imports + (imports ? '\n' : '') + finalCode;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getFullCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.title.replace(/\s+/g, '-').toLowerCase()}-component.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Basic scope for react-live to render Tailwind and basic React
  const scope = { React, ...LucideIcons };

  // Clean up code for react-live (it crashes if it sees import/export statements)
  let codeToRender = activeProject.generatedCode;
  codeToRender = codeToRender.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
  codeToRender = codeToRender.replace(/export\s+default\s+/g, '');
  codeToRender = codeToRender.replace(/export\s+/g, '');

  // Add render() to the end of the code if it's just a component definition
  if (codeToRender.includes('function GeneratedComponent') || codeToRender.includes('const GeneratedComponent')) {
    codeToRender += '\n\nrender(<GeneratedComponent />);';
  }

  return (
    <div className="flex-1 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Generated Output
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download .tsx
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <div className="px-4 pt-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-auto bg-slate-100/50 dark:bg-slate-950/50">
          <div className="min-h-full p-8 flex items-start justify-center">
            <div className="bg-white dark:bg-slate-950 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden">
              <LiveProvider code={codeToRender} scope={scope} noInline={true}>
                <div className="p-6">
                  <LivePreview />
                </div>
                <LiveError className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 font-mono text-sm border-t border-red-100 dark:border-red-900/30 whitespace-pre-wrap" />
              </LiveProvider>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-0 m-0 overflow-hidden bg-[#1E1E1E]">
          <SyntaxHighlighter
            language="tsx"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              height: '100%',
              fontSize: '14px',
              borderRadius: 0,
            }}
            showLineNumbers
          >
            {getFullCode()}
          </SyntaxHighlighter>
        </TabsContent>
      </Tabs>
    </div>
  );
}
