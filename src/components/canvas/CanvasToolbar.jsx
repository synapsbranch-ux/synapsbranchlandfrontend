import React, { useState } from 'react';
import { Save, Play, Download, Copy, Undo, Redo, Check, Loader2, FileCode } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { toast } from 'sonner';

const CanvasToolbar = () => {
    const {
        content,
        language,
        setLanguage,
        saving,
        saveVersion,
        undo,
        redo,
        currentVersionIndex,
        versions,
        isAIWriting
    } = useCanvasStore();

    const [copied, setCopied] = useState(false);

    const handleSave = async () => {
        try {
            await saveVersion();
            toast.success('Version saved!');
        } catch (e) {
            toast.error('Failed to save version');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied to clipboard');
        } catch (e) {
            toast.error('Failed to copy');
        }
    };

    const handleExport = () => {
        const ext = language === 'javascript' ? 'js' :
            language === 'typescript' ? 'ts' :
                language === 'python' ? 'py' : language;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canvas-export.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRun = () => {
        // For HTML, this would typically switch to preview mode
        // For JS, we could try to eval (dangerous in prod, but for demo...)
        if (language === 'javascript' || language === 'js') {
            try {
                // DANGEROUS: Only for demo/sandbox
                // eslint-disable-next-line no-eval
                eval(content);
                toast.success('Code executed');
            } catch (e) {
                toast.error(`Error: ${e.message}`);
            }
        } else {
            // Switch to preview mode for HTML
            useCanvasStore.getState().setMode('preview');
        }
    };

    const languages = [
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'json', label: 'JSON' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'mermaid', label: 'Mermaid' },
        { value: 'sql', label: 'SQL' },
    ];

    const canUndo = currentVersionIndex > 0;
    const canRedo = currentVersionIndex < versions.length - 1;

    return (
        <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
            {/* Left: Language Selector */}
            <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isAIWriting}
                    className="bg-[#3c3c3c] text-slate-300 text-xs px-2 py-1 rounded border border-[#4c4c4c] focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                    {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>

                {/* AI Writing Indicator */}
                {isAIWriting && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                        <span className="text-xs text-purple-300 font-medium">AI Writing...</span>
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                {/* Undo/Redo */}
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-[#4c4c4c] mx-1" />

                {/* Run */}
                <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    title="Run / Preview"
                >
                    <Play className="w-3.5 h-3.5" />
                    Run
                </button>

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50 transition-colors"
                    title="Save Version (Ctrl+S)"
                >
                    {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Save className="w-3.5 h-3.5" />
                    )}
                    Save
                </button>

                <div className="w-px h-4 bg-[#4c4c4c] mx-1" />

                {/* Copy */}
                <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy to Clipboard"
                >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Export */}
                <button
                    onClick={handleExport}
                    className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white transition-colors"
                    title="Download File"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CanvasToolbar;
