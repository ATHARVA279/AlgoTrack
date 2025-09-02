interface CodeHighlighterProps {
  code: string;
  language: string;
  customStyle?: React.CSSProperties;
}

// Simple syntax highlighting with basic patterns
const getLanguageClass = (language: string): string => {
  const lang = language.toLowerCase();
  if (lang.includes('javascript') || lang.includes('js')) return 'language-javascript';
  if (lang.includes('python') || lang.includes('py')) return 'language-python';
  if (lang.includes('java')) return 'language-java';
  if (lang.includes('cpp') || lang.includes('c++')) return 'language-cpp';
  if (lang.includes('c')) return 'language-c';
  return 'language-text';
};

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  customStyle = {},
}) => {
  const languageClass = getLanguageClass(language);
  
  return (
    <div 
      className={`code-highlighter ${languageClass}`}
      style={{
        background: "transparent",
        padding: "1.5rem",
        margin: 0,
        borderRadius: "0.5rem",
        fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        fontSize: "14px",
        lineHeight: "1.5",
        overflow: "auto",
        ...customStyle,
      }}
    >
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  );
};