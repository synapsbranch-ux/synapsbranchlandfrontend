import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Wrench, Code, FileText, ImageIcon, Sparkles } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import ModelSelector from './ModelSelector';
import { useCanvasStore } from '../store/useCanvasStore';

const ChatInput = ({
    input,
    setInput,
    onSend,
    disabled,
    selectedModel,
    onModelChange,
    onFileUpload
}) => {
    const inputRef = useRef(null);
    const [toolsOpen, setToolsOpen] = useState(false);
    const { openCanvas, isOpen: canvasOpen } = useCanvasStore();

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) {
                onSend();
            }
        }
    };

    const handleToolClick = (tool) => {
        setToolsOpen(false);

        switch (tool) {
            case 'canvas':
                openCanvas('', 'html');
                break;
            case 'code':
                openCanvas('// Write your code here\n', 'javascript');
                break;
            case 'diagram':
                openCanvas('flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]', 'mermaid');
                break;
            case 'markdown':
                openCanvas('# Title\n\nStart writing...', 'markdown');
                break;
            default:
                break;
        }
    };

    return (
        <div className="floating-input bg-card border border-border shadow-lg rounded-xl relative">
            <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message SynapsBranch..."
                rows={1}
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                style={{ minHeight: '48px', maxHeight: '200px' }}
                data-testid="chat-input-textarea"
                autoFocus
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                    <ModelSelector value={selectedModel} onChange={onModelChange} />

                    {/* Tools Menu */}
                    <Popover.Root open={toolsOpen} onOpenChange={setToolsOpen}>
                        <Popover.Trigger asChild>
                            <button
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${canvasOpen
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                    }`}
                                data-testid="tools-btn"
                                title="Tools & Canvas"
                            >
                                <Wrench className="w-4 h-4" />
                                <span>Tools</span>
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                className="bg-card border border-border rounded-xl shadow-xl w-56 overflow-hidden z-50"
                                side="top"
                                align="start"
                                sideOffset={8}
                            >
                                <div className="p-1">
                                    <button
                                        onClick={() => handleToolClick('canvas')}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-left transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Canvas</span>
                                            <span className="text-xs text-muted-foreground">Interactive editor</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleToolClick('code')}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-left transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <Code className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Code Editor</span>
                                            <span className="text-xs text-muted-foreground">Write & run code</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleToolClick('diagram')}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-left transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Diagram</span>
                                            <span className="text-xs text-muted-foreground">Mermaid flowcharts</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleToolClick('markdown')}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-left transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">Document</span>
                                            <span className="text-xs text-muted-foreground">Rich markdown</span>
                                        </div>
                                    </button>
                                </div>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>

                    {onFileUpload && (
                        <button
                            onClick={onFileUpload}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            data-testid="file-upload-btn"
                            title="Attach file"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={onSend}
                    disabled={disabled || !input.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    data-testid="send-message-btn"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
