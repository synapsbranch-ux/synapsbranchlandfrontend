import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Folder, Palette, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6',
];

const NewProjectModal = ({ onClose }) => {
  const { createWorkspace, setCurrentWorkspace, setMode } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    setLoading(true);
    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        color,
        system_prompt: systemPrompt,
      });
      setCurrentWorkspace(workspace);
      setMode('workspace');
      toast.success('Project created!');
      onClose();
    } catch (e) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="new-project-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Project</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="project-name-input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="project-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-ring scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      data-testid={`color-${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">System Prompt</label>
                <p className="text-sm text-muted-foreground mb-3">
                  Define the AI&apos;s behavior for all conversations in this project.
                </p>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful AI assistant..."
                  rows={6}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  data-testid="system-prompt-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[hsl(239,84%,67%)]' : 'bg-muted'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[hsl(239,84%,67%)]' : 'bg-muted'}`} />
          </div>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-[hsl(239,84%,67%)] text-white rounded-lg hover:bg-[hsl(239,84%,60%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="next-step-btn"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 text-sm bg-[hsl(239,84%,67%)] text-white rounded-lg hover:bg-[hsl(239,84%,60%)] disabled:opacity-50 transition-colors"
                data-testid="create-project-btn"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
