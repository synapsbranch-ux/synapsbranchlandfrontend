import React, { useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';

const MODELS = [
  { id: 'amazon.nova-pro-v1:0', name: 'Amazon Nova Pro', provider: 'AWS Bedrock', color: '#ec4899' },
  { id: 'meta.llama3-70b-instruct-v1:0', name: 'Llama 3 70B', provider: 'AWS Bedrock', color: '#3b82f6' },
  { id: 'mistral.mistral-large-2402-v1:0', name: 'Mistral Large', provider: 'AWS Bedrock', color: '#f59e0b' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: '#10b981' },
];

const ModelSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = MODELS.find((m) => m.id === value) || MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        data-testid="model-selector-btn"
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.color }} />
        <span className="text-sm truncate max-w-[100px]">{selected.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[var(--z-modal-backdrop)]" onClick={() => setOpen(false)} />
          <div className="dropdown-menu bottom-full mb-2 left-0 w-64 overflow-hidden animate-fade-in" data-testid="model-dropdown">
            <div className="px-3 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Select Model
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors ${model.id === value ? 'bg-muted/50' : ''
                    }`}
                  data-testid={`model-option-${model.id}`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
