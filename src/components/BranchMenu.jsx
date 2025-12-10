import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';

const BranchMenu = ({ branches, currentBranch, onSelect, onClose }) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onSelect(newName.trim());
      setCreating(false);
      setNewName('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)]" onClick={onClose} />

      {/* Menu - positioned relative to parent */}
      <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-fade-in" style={{ zIndex: 'var(--z-dropdown)' }} data-testid="branch-menu">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Switch Branch
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {branches.map((branch) => (
            <button
              key={branch.name}
              onClick={() => onSelect(branch.name)}
              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors ${branch.name === currentBranch ? 'bg-muted/50' : ''
                }`}
              data-testid={`branch-option-${branch.name}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${branch.name === currentBranch ? 'bg-[hsl(239,84%,67%)]' : 'bg-muted-foreground'
                    }`}
                />
                <span className="text-sm font-medium">{branch.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{branch.message_count} msgs</span>
                {branch.name === currentBranch && <Check className="w-4 h-4 text-[hsl(239,84%,67%)]" />}
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-border">
          {creating ? (
            <div className="p-2">
              <input
                type="text"
                placeholder="Branch name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid="new-branch-name-input"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setCreating(false)}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-2 py-1 text-xs bg-[hsl(239,84%,67%)] text-white rounded"
                  data-testid="confirm-new-branch-btn"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              data-testid="create-new-branch-btn"
            >
              <Plus className="w-4 h-4" />
              Create New Branch
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BranchMenu;
