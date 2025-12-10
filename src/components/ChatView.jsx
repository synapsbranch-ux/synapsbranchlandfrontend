import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { GitBranch, ChevronDown, Plus, Send, Paperclip, Maximize2, X, Loader2, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import MessageBubble from './MessageBubble';
import GitGraph from './GitGraph';
import BranchMenu from './BranchMenu';
import FileUploadModal from './FileUploadModal';
import ChatInput from './ChatInput';
import { CanvasContainer } from './canvas';

const ChatView = ({ onSidebarToggle }) => {
  const {
    currentConversation,
    messages,
    branches,
    currentBranch,
    sending,
    loadingMessages,
    streamingMessage,
    fetchMessages,
    fetchBranches,
    fetchTree,
    sendMessage,
    setCurrentBranch,
    theme,
    setTheme,
  } = useStore();

  const { openCanvas } = useCanvasStore();

  const [input, setInput] = useState('');
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showGitGraph, setShowGitGraph] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
      fetchBranches(currentConversation.id);
    }
  }, [currentConversation, fetchMessages, fetchBranches]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Detect code blocks in streaming message to auto-open canvas
  useEffect(() => {
    if (streamingMessage) {
      const codeBlockMatch = streamingMessage.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        const language = codeBlockMatch[1] || 'javascript';
        const code = codeBlockMatch[2];
        // Only open canvas for substantial code blocks
        if (code.length > 100 && !useCanvasStore.getState().isOpen) {
          openCanvas(code, language);
        }
      }
    }
  }, [streamingMessage, openCanvas]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');

    // Find the last message in current branch to use as parent
    const branchMessages = messages.filter((m) => m.branch_name === currentBranch);
    const parentId = branchMessages.length > 0 ? branchMessages[branchMessages.length - 1].id : null;

    // Build canvas context if canvas is open
    const canvasState = useCanvasStore.getState();
    const canvasContext = canvasState.isOpen ? {
      isOpen: true,
      content: canvasState.content,
      language: canvasState.language
    } : null;

    try {
      await sendMessage(currentConversation.id, content, parentId, currentBranch, selectedModel, canvasContext);
      fetchBranches(currentConversation.id);
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleGitGraph = useCallback(() => {
    if (!showGitGraph && currentConversation) {
      fetchTree(currentConversation.id);
    }
    setShowGitGraph(!showGitGraph);
  }, [showGitGraph, currentConversation, fetchTree]);

  // Filter messages for current branch
  const branchMessages = messages.filter((m) => m.branch_name === currentBranch);

  if (!currentConversation) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a chat</div>;
  }

  // Wrap the chat content in CanvasContainer for split-screen
  return (
    <CanvasContainer>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative" data-testid="chat-view">
        {/* Transparent Header - blends with background */}
        <div className="chat-header flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Burger menu button */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Branch indicator */}
            <div className="relative z-[var(--z-dropdown)]">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                data-testid="branch-selector-btn"
              >
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{currentBranch}</span>
                <span className="text-xs text-muted-foreground">{branches.length} branches</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showBranchMenu && (
                <BranchMenu
                  branches={branches}
                  currentBranch={currentBranch}
                  onSelect={(name) => {
                    setCurrentBranch(name);
                    setShowBranchMenu(false);
                  }}
                  onClose={() => setShowBranchMenu(false)}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="theme-toggle"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Git graph toggle */}
            <button
              onClick={toggleGitGraph}
              className={`p-2 rounded-lg transition-colors ${showGitGraph ? 'bg-[hsl(239,84%,67%)] text-white' : 'hover:bg-muted'
                }`}
              data-testid="git-graph-toggle-btn"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Git Graph Panel */}
        {showGitGraph && (
          <div className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentConversation.title}</span>
                <span className="text-xs text-muted-foreground">Git Timeline • {branches.length} branches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="branch-pill active">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  {currentBranch}
                </span>
                <button onClick={() => setShowGitGraph(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <GitGraph conversationId={currentConversation.id} />
          </div>
        )}

        {/* Messages - scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : branchMessages.length === 0 && !streamingMessage ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Start the conversation...
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {branchMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {/* Streaming message */}
              {streamingMessage && (
                <div className="flex justify-start animate-fade-in">
                  <div className="chat-bubble-ai">
                    <div className="markdown-content">
                      <p className="streaming-cursor">{streamingMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              {sending && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input - fixed at bottom center */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSend}
              disabled={!input.trim() || sending}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onFileUpload={() => setShowFileUpload(true)}
            />
          </div>
        </div>

        {/* File Upload Modal */}
        {showFileUpload && <FileUploadModal onClose={() => setShowFileUpload(false)} />}
      </div>
    </CanvasContainer>
  );
};

export default ChatView;
