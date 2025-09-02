import { lazy, Suspense } from 'react';

// Lazy load Monaco Editor to reduce initial bundle size
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  height?: string;
  theme?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = "400px",
  theme = "vs-dark"
}) => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-96 bg-cyber-darker rounded-lg">
          <div className="text-gray-400">Loading editor...</div>
        </div>
      }
    >
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </Suspense>
  );
};