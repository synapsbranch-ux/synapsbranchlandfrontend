import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Save, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

const WorkspaceInstructions = ({ workspaceId }) => {
    const { currentWorkspace, updateWorkspace } = useStore();
    const [instructions, setInstructions] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (currentWorkspace && currentWorkspace.system_prompt) {
            setInstructions(currentWorkspace.system_prompt);
        }
    }, [currentWorkspace]);

    const handleSave = async () => {
        if (!workspaceId) return;

        setSaving(true);
        try {
            await updateWorkspace(workspaceId, {
                system_prompt: instructions
            });
            toast.success('Instructions updated');
            setEditing(false);
        } catch (e) {
            toast.error('Failed to update instructions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">System Instructions</h4>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-3">
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Add instructions for Claude's responses..."
                        rows={8}
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setEditing(false);
                                setInstructions(currentWorkspace?.system_prompt || '');
                            }}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-muted/30 rounded-lg">
                    {instructions ? (
                        <p className="text-sm whitespace-pre-wrap">{instructions}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No instructions set. Click Edit to add instructions for AI responses.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkspaceInstructions;
