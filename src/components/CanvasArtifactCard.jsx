import React from 'react';
import { Code2, ExternalLink, Eye, FileCode } from 'lucide-react';
import { useCanvasStore } from '../store/useCanvasStore';

/**
 * CanvasArtifactCard - Renders in chat as a reference to generated canvas code
 * Clicking opens the canvas with the stored code
 */
const CanvasArtifactCard = ({ artifact }) => {
    const { openCanvas, loadArtifact } = useCanvasStore();

    const handleOpen = () => {
        if (artifact.artifactId) {
            // Load from database
            loadArtifact(artifact.artifactId);
        } else {
            // Open with inline content
            openCanvas(artifact.content, artifact.language);
        }
    };

    // Get language display name
    const getLanguageDisplay = (lang) => {
        const names = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'jsx': 'React JSX',
            'tsx': 'React TSX',
            'html': 'HTML',
            'css': 'CSS',
            'python': 'Python',
            'mermaid': 'Mermaid Diagram',
            'json': 'JSON',
            'markdown': 'Markdown'
        };
        return names[lang] || lang?.toUpperCase() || 'Code';
    };

    // Get gradient colors based on language
    const getGradient = (lang) => {
        const gradients = {
            'javascript': 'from-yellow-500/20 to-yellow-600/10',
            'typescript': 'from-blue-500/20 to-blue-600/10',
            'jsx': 'from-cyan-500/20 to-blue-500/10',
            'tsx': 'from-cyan-500/20 to-blue-500/10',
            'html': 'from-orange-500/20 to-red-500/10',
            'css': 'from-purple-500/20 to-pink-500/10',
            'python': 'from-green-500/20 to-emerald-500/10',
            'mermaid': 'from-pink-500/20 to-purple-500/10'
        };
        return gradients[lang] || 'from-slate-500/20 to-slate-600/10';
    };

    // Preview first few lines of code
    const getPreview = (content) => {
        if (!content) return '';
        const lines = content.split('\n').slice(0, 4);
        return lines.join('\n');
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl border border-border/50
                bg-gradient-to-br ${getGradient(artifact.language)}
                hover:border-primary/50 transition-all duration-200 cursor-pointer
                group my-3
            `}
            onClick={handleOpen}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <FileCode className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-foreground">
                            Canvas Artifact
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                            {getLanguageDisplay(artifact.language)}
                        </span>
                    </div>
                </div>
                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                    }}
                >
                    <Eye className="w-3.5 h-3.5" />
                    Open Canvas
                </button>
            </div>

            {/* Code Preview */}
            <div className="p-3 max-h-32 overflow-hidden relative">
                <pre className="text-xs text-muted-foreground font-mono leading-relaxed">
                    <code>{getPreview(artifact.content)}</code>
                </pre>
                {/* Fade overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                    {artifact.content?.split('\n').length || 0} lines
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Click to edit</span>
                    <ExternalLink className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

export default CanvasArtifactCard;
