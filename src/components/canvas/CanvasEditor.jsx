import React, { useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Loader2 } from 'lucide-react';

const CanvasEditor = () => {
    const { content, language, updateContent } = useCanvasStore();
    const editorRef = useRef(null);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;

        // Configure Monaco theme to match VS Code Dark+
        monaco.editor.defineTheme('synapsbranch', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#858585',
                'editorCursor.foreground': '#aeafad',
                'editor.selectionBackground': '#264f78',
                'editor.lineHighlightBackground': '#2a2a2a',
            }
        });
        monaco.editor.setTheme('synapsbranch');

        // Auto-focus
        editor.focus();
    }, []);

    const handleChange = useCallback((value) => {
        updateContent(value || '');
    }, [updateContent]);

    // Map our language to Monaco language ID
    const getMonacoLanguage = (lang) => {
        const mapping = {
            'html': 'html',
            'css': 'css',
            'javascript': 'javascript',
            'js': 'javascript',
            'typescript': 'typescript',
            'ts': 'typescript',
            'json': 'json',
            'python': 'python',
            'py': 'python',
            'markdown': 'markdown',
            'md': 'markdown',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'sql': 'sql',
            'yaml': 'yaml',
            'xml': 'xml',
            'mermaid': 'markdown', // Fallback
        };
        return mapping[lang.toLowerCase()] || 'plaintext';
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={content}
                onChange={handleChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                loading={
                    <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                }
                options={{
                    minimap: { enabled: true, scale: 0.75 },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    bracketPairColorization: { enabled: true },
                    padding: { top: 10 },
                    renderLineHighlight: 'all',
                    suggest: {
                        showMethods: true,
                        showFunctions: true,
                        showConstructors: true,
                        showFields: true,
                        showVariables: true,
                        showClasses: true,
                        showStructs: true,
                        showInterfaces: true,
                        showModules: true,
                        showProperties: true,
                        showEvents: true,
                        showOperators: true,
                        showUnits: true,
                        showValues: true,
                        showConstants: true,
                        showEnums: true,
                        showEnumMembers: true,
                        showKeywords: true,
                        showWords: true,
                        showColors: true,
                        showFiles: true,
                        showReferences: true,
                        showFolders: true,
                        showTypeParameters: true,
                        showSnippets: true,
                    }
                }}
            />
        </div>
    );
};

export default CanvasEditor;
