import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useCanvasStore } from '../../store/useCanvasStore';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
});

const CanvasPreview = () => {
    const { content, language } = useCanvasStore();
    const iframeRef = useRef(null);
    const mermaidRef = useRef(null);
    const [error, setError] = useState(null);
    const [mermaidSvg, setMermaidSvg] = useState('');

    // Detect content type
    const isMermaid = language === 'mermaid' ||
        content.trim().startsWith('graph') ||
        content.trim().startsWith('sequenceDiagram') ||
        content.trim().startsWith('flowchart') ||
        content.trim().startsWith('classDiagram') ||
        content.trim().startsWith('stateDiagram') ||
        content.trim().startsWith('erDiagram') ||
        content.trim().startsWith('gantt') ||
        content.trim().startsWith('pie') ||
        content.trim().startsWith('journey');

    const isHtml = language === 'html' || content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html');
    const isMarkdown = language === 'markdown' || language === 'md';

    // Render Mermaid diagrams
    useEffect(() => {
        if (isMermaid && content.trim()) {
            const renderMermaid = async () => {
                try {
                    setError(null);
                    const { svg } = await mermaid.render(`mermaid-${Date.now()}`, content);
                    setMermaidSvg(svg);
                } catch (e) {
                    console.error('Mermaid render error:', e);
                    setError(`Diagram Error: ${e.message}`);
                    setMermaidSvg('');
                }
            };
            renderMermaid();
        }
    }, [content, isMermaid]);

    // Render HTML in iframe
    useEffect(() => {
        if (isHtml && iframeRef.current) {
            try {
                setError(null);
                const doc = iframeRef.current.contentDocument;
                doc.open();
                doc.write(content);
                doc.close();
            } catch (e) {
                setError(`Preview Error: ${e.message}`);
            }
        }
    }, [content, isHtml]);

    // Mermaid Preview
    if (isMermaid) {
        return (
            <div className="h-full w-full bg-slate-900 overflow-auto p-4">
                {error ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
                            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                ) : mermaidSvg ? (
                    <div
                        ref={mermaidRef}
                        className="flex items-center justify-center min-h-full"
                        dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <p>Enter a Mermaid diagram...</p>
                    </div>
                )}
            </div>
        );
    }

    // HTML Preview (Sandboxed iframe)
    if (isHtml || language === 'html') {
        return (
            <div className="h-full w-full bg-white relative">
                {error && (
                    <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-3 py-1 rounded-full">
                        {error}
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                    style={{ backgroundColor: 'white' }}
                />
            </div>
        );
    }

    // Default: Raw content preview
    return (
        <div className="h-full w-full bg-slate-900 overflow-auto p-4">
            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words">
                {content || <span className="text-slate-500">No content to preview...</span>}
            </pre>
        </div>
    );
};

export default CanvasPreview;
