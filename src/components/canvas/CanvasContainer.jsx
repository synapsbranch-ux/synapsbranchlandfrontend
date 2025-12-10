import React, { useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import CanvasEditor from './CanvasEditor';
import CanvasPreview from './CanvasPreview';
import CanvasToolbar from './CanvasToolbar';
import VersionHistory from './VersionHistory';
import { useCanvasStore } from '../../store/useCanvasStore';

const CanvasContainer = ({ children }) => {
    const {
        isOpen,
        mode,
        content,
        language,
        closeCanvas,
        setMode
    } = useCanvasStore();

    // Keyboard shortcut: Escape to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeCanvas();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeCanvas]);

    if (!isOpen) {
        return <div className="flex-1 flex flex-col h-full">{children}</div>;
    }

    return (
        <PanelGroup direction="horizontal" className="flex-1 h-full">
            {/* Chat Panel */}
            <Panel defaultSize={50} minSize={30} className="flex flex-col h-full">
                {children}
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

            {/* Canvas Panel */}
            <Panel defaultSize={50} minSize={25} className="flex flex-col h-full bg-[#1e1e1e]">
                {/* Canvas Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">Canvas</span>
                        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                            {language.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode Toggle */}
                        <div className="flex items-center gap-1 bg-[#3c3c3c] rounded-md p-0.5">
                            <button
                                onClick={() => setMode('code')}
                                className={`px-3 py-1 text-xs rounded ${mode === 'code' ? 'bg-[#0e639c] text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Code
                            </button>
                            <button
                                onClick={() => setMode('preview')}
                                className={`px-3 py-1 text-xs rounded ${mode === 'preview' ? 'bg-[#0e639c] text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => setMode('split')}
                                className={`px-3 py-1 text-xs rounded ${mode === 'split' ? 'bg-[#0e639c] text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Split
                            </button>
                        </div>

                        <VersionHistory />

                        {/* Close Button */}
                        <button
                            onClick={closeCanvas}
                            className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white transition-colors"
                            title="Close Canvas (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Canvas Toolbar */}
                <CanvasToolbar />

                {/* Canvas Content Area */}
                <div className="flex-1 overflow-hidden">
                    {mode === 'code' && (
                        <CanvasEditor />
                    )}
                    {mode === 'preview' && (
                        <CanvasPreview />
                    )}
                    {mode === 'split' && (
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={50} minSize={20}>
                                <CanvasEditor />
                            </Panel>
                            <PanelResizeHandle className="w-1 bg-[#3c3c3c] hover:bg-[#0e639c] transition-colors cursor-col-resize" />
                            <Panel defaultSize={50} minSize={20}>
                                <CanvasPreview />
                            </Panel>
                        </PanelGroup>
                    )}
                </div>
            </Panel>
        </PanelGroup>
    );
};

export default CanvasContainer;
