import React from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Code, FileText, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const EmptyState = () => {
  const { mode, createConversation, setCurrentConversation, currentWorkspace } = useStore();

  const suggestions = [
    { icon: Code, label: 'Code review help', prompt: 'Help me review this code for best practices' },
    { icon: FileText, label: 'Explain RAG systems', prompt: 'Explain how RAG systems work in AI applications' },
    { icon: GitBranch, label: 'Project planning', prompt: 'Help me plan a new software project' },
  ];

  const handleSuggestion = async (prompt) => {
    try {
      const conv = await createConversation(mode === 'workspace' ? currentWorkspace?.id : null);
      setCurrentConversation(conv);
      // The prompt will be handled by ChatView
    } catch (e) {
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" data-testid="empty-state">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-foreground rounded-2xl flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-background" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h1>
        <p className="text-muted-foreground mb-8">
          Start a conversation to explore ideas, analyze documents, or get help with coding tasks.
        </p>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestion(suggestion.prompt)}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              data-testid={`suggestion-${idx}`}
            >
              <suggestion.icon className="w-4 h-4 text-muted-foreground" />
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
