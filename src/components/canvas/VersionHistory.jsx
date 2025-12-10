import React, { useState } from 'react';
import { ChevronDown, History, Clock, Check } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import * as Popover from '@radix-ui/react-popover';

const VersionHistory = () => {
    const { versions, currentVersionIndex, restoreVersion } = useCanvasStore();
    const [open, setOpen] = useState(false);

    if (versions.length === 0) {
        return null;
    }

    const currentVersion = versions[currentVersionIndex];

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return 'Today';
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white text-xs transition-colors"
                    title="Version History"
                >
                    <History className="w-3.5 h-3.5" />
                    <span>v{currentVersionIndex + 1}</span>
                    <ChevronDown className="w-3 h-3" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-64 max-h-80 overflow-hidden z-50"
                    align="end"
                    sideOffset={5}
                >
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-[#3c3c3c]">
                        <h4 className="text-sm font-medium text-white">Version History</h4>
                        <p className="text-xs text-slate-400">{versions.length} versions</p>
                    </div>

                    {/* Version List */}
                    <div className="max-h-60 overflow-y-auto">
                        {versions.slice().reverse().map((version, reverseIndex) => {
                            const index = versions.length - 1 - reverseIndex;
                            const isActive = index === currentVersionIndex;

                            return (
                                <button
                                    key={version.id}
                                    onClick={() => {
                                        restoreVersion(index);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#3c3c3c] transition-colors text-left ${isActive ? 'bg-[#0e639c]/30' : ''
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isActive ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-slate-400'
                                        }`}>
                                        {version.saved ? <Check className="w-3 h-3" /> : index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white font-medium">
                                                Version {index + 1}
                                            </span>
                                            {version.saved && (
                                                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                                    SAVED
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(version.timestamp)}</span>
                                            <span>•</span>
                                            <span>{formatTime(version.timestamp)}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default VersionHistory;
