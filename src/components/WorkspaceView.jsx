import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Brain, Network, Plus, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WorkspaceInstructions from './WorkspaceInstructions';
import WorkspaceFiles from './WorkspaceFiles';
import MindMapViewer from './MindMapViewer';
import KnowledgeGraphViewer from './KnowledgeGraphViewer';
import ChatInput from './ChatInput';

const WorkspaceView = () => {
    const {
        currentWorkspace,
        conversations,
        createConversation,
        setCurrentConversation,
        sendMessage,
    } = useStore();

    const navigate = useNavigate();
    const [showMindMap, setShowMindMap] = useState(false);
    const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

    const handleStartChat = async () => {
        if (!input.trim() || sending || !currentWorkspace) return;

        setSending(true);
        try {
            // 1. Create new conversation
            const conv = await createConversation(currentWorkspace.id, input.trim().substring(0, 50));

            // 2. Send the first message with the selected model
            await sendMessage(conv.id, input.trim(), null, 'main', selectedModel);

            // 3. Navigate
            setCurrentConversation(conv);
            navigate(`/chat/${conv.id}`);

        } catch (e) {
            console.error(e);
            toast.error('Failed to start conversation');
        } finally {
            setSending(false);
        }
    };

    const handleOpenChat = (conv) => {
        setCurrentConversation(conv);
        navigate(`/chat/${conv.id}`);
    };

    // Filter conversations for this workspace
    const workspaceConversations = conversations.filter(
        (c) => c.workspace_id === currentWorkspace?.id
    );

    if (!currentWorkspace) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Loading workspace...
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 flex h-full overflow-hidden bg-background" data-testid="workspace-dashboard">

                {/* Main Center Column */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    <div className="max-w-4xl mx-auto w-full px-8 py-10 space-y-8">

                        {/* Header */}
                        <div>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                All projects
                            </button>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-serif font-medium mb-2 text-foreground tracking-tight">
                                        {currentWorkspace.name}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {currentWorkspace.description || 'Welcome to your workspace'}
                                    </p>
                                </div>
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: currentWorkspace.color }}
                                >
                                    {currentWorkspace.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Reusable Chat Input */}
                        <div className="relative group">
                            <ChatInput
                                input={input}
                                setInput={setInput}
                                onSend={handleStartChat}
                                disabled={!input.trim() || sending}
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                                onFileUpload={() => toast.info('File upload coming soon for dashboard')}
                            />
                        </div>

                        {/* Conversation List (History) */}
                        <div className="space-y-4">
                            {workspaceConversations.length > 0 && (
                                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                                    Recent Chats
                                </h3>
                            )}

                            {workspaceConversations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground text-sm">No conversations yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {workspaceConversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="group flex flex-col p-4 bg-transparent border-b border-border/40 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer"
                                            onClick={() => handleOpenChat(conv)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {conv.title || 'Untitled Conversation'}
                                                </h4>
                                                <span className="text-xs text-muted-foreground/60">
                                                    {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                Click to resume conversation...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Right Context Panel */}
                <div className="w-80 border-l border-border bg-card/30 flex flex-col flex-shrink-0 p-6 space-y-6">
                    {/* Visualizers */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setShowMindMap(true)}
                                className="flex flex-col items-center justify-center p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all text-center gap-2"
                            >
                                <Brain className="w-5 h-5 text-primary" />
                                <span className="text-xs font-medium">Mind Map</span>
                            </button>
                            <button
                                onClick={() => setShowKnowledgeGraph(true)}
                                className="flex flex-col items-center justify-center p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all text-center gap-2"
                            >
                                <Network className="w-5 h-5 text-purple-500" />
                                <span className="text-xs font-medium">Graph</span>
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Instructions</h3>
                            <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                        <div className="bg-muted/30 border border-border rounded-xl p-0 overflow-hidden">
                            <WorkspaceInstructions workspaceId={currentWorkspace.id} />
                        </div>
                    </div>

                    {/* Files */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Files</h3>
                            <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                        <div className="bg-muted/30 border border-border rounded-xl p-0 overflow-hidden">
                            <WorkspaceFiles workspaceId={currentWorkspace.id} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            {showMindMap && (
                <MindMapViewer
                    workspaceId={currentWorkspace.id}
                    onClose={() => setShowMindMap(false)}
                />
            )}

            {showKnowledgeGraph && (
                <KnowledgeGraphViewer
                    workspaceId={currentWorkspace.id}
                    onClose={() => setShowKnowledgeGraph(false)}
                />
            )}
        </>
    );
};

export default WorkspaceView;
