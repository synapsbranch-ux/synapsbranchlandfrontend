import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { ArrowLeft, Code, Image, FileCode, Filter, Download, X, Search, Network, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MindMapViewer from './MindMapViewer';
import KnowledgeGraphViewer from './KnowledgeGraphViewer';

const ArtifactsGallery = () => {
  const { artifacts, fetchArtifacts, loadingArtifacts, theme, initTheme } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // For visualizations
  const [activeViz, setActiveViz] = useState(null); // { type: 'mindmap' | 'knowledge_graph', workspaceId: '...' }

  useEffect(() => {
    initTheme();
    // Assuming we want artifacts from the current workspace or global? 
    // The gallery seems global currently. The modifications in useStore depend on workspaceId being passed.
    // If this page is global, we might not see visualizations until we pass an ID.
    // For now, let's assume global access or handled by the parent route if it passes props.
    // Wait, useStore fetches based on args. If ArtifactsGallery is standalone, it needs context.
    // If it's used inside a workspace, we need to know the workspace ID.
    // Let's assume we fetch all for now, but useStore modification needs workspaceId for Viz.
    // I will pass 'null' effectively triggering empty viz list if global, BUT 
    // if the user is in a workspace context (which we can guess from URL or store), we should use it.
    // Let's check store.currentWorkspace
    const { currentWorkspace } = useStore.getState();
    fetchArtifacts(currentWorkspace?.id);
  }, [fetchArtifacts, initTheme]);

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesFilter = filter === 'all' ||
      (filter === 'visualization' && artifact.type.startsWith('visualization_')) ||
      artifact.type === filter;
    const matchesSearch = artifact.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getArtifactIcon = (type) => {
    switch (type) {
      case 'code':
        return <Code className="w-5 h-5" />;
      case 'mermaid':
        return <FileCode className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'visualization_mindmap':
        return <Network className="w-5 h-5" />;
      case 'visualization_knowledge_graph':
        return <Share2 className="w-5 h-5" />;
      case 'canvas':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <FileCode className="w-5 h-5" />;
    }
  };

  const handleArtifactClick = (artifact) => {
    // Use workspace_id from the artifact itself, fallback to currentWorkspace
    const vizWorkspaceId = artifact.workspace_id || useStore.getState().currentWorkspace?.id;

    if (artifact.type === 'visualization_mindmap') {
      setActiveViz({ type: 'mindmap', workspaceId: vizWorkspaceId });
    } else if (artifact.type === 'visualization_knowledge_graph') {
      setActiveViz({ type: 'knowledge_graph', workspaceId: vizWorkspaceId });
    } else if (artifact.type === 'canvas') {
      // Open canvas with artifact content
      useCanvasStore.getState().loadArtifact(artifact.id);
      navigate('/');  // Return to chat view with canvas open
    } else {
      setSelectedArtifact(artifact);
    }
  };

  const handleDownload = (artifact) => {
    // If visualization, content is likely not the full JSON in the list item if I excluded data... 
    // Wait, my backend excluded 'data'. So I cannot download the full content here without re-fetching.
    // I'll disable download for viz for now or implement fetch-on-demand.
    if (artifact.type.startsWith('visualization_')) {
      alert("Please open the visualization to export it.");
      return;
    }
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact-${artifact.id}.${artifact.type === 'code' ? 'txt' : artifact.type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="artifacts-gallery">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Artifacts Gallery</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Types</option>
                  <option value="code">Code</option>
                  <option value="mermaid">Diagrams</option>
                  <option value="image">Images</option>
                  <option value="visualization">Visualizations</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loadingArtifacts ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-[hsl(239,84%,67%)] border-t-transparent rounded-full" />
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div className="text-center py-16">
            <FileCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No artifacts yet</h2>
            <p className="text-muted-foreground">
              Artifacts will appear here when you generate code, diagrams, or other content in your chats.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                onClick={() => handleArtifactClick(artifact)}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-[hsl(239,84%,67%)]/50 transition-colors cursor-pointer group"
              >
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  {getArtifactIcon(artifact.type)}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                      {artifact.type.replace('visualization_', '')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(artifact.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {artifact.content?.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {selectedArtifact && (
        <div className="modal-overlay" onClick={() => setSelectedArtifact(null)}>
          <div
            className="modal-content max-w-4xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                {getArtifactIcon(selectedArtifact.type)}
                <span className="font-medium capitalize">{selectedArtifact.type} Artifact</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedArtifact)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {selectedArtifact.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Visualization Viewers */}
      {activeViz && activeViz.type === 'mindmap' && (
        <MindMapViewer
          workspaceId={activeViz.workspaceId}
          onClose={() => setActiveViz(null)}
        />
      )}
      {activeViz && activeViz.type === 'knowledge_graph' && (
        <KnowledgeGraphViewer
          workspaceId={activeViz.workspaceId}
          onClose={() => setActiveViz(null)}
        />
      )}
    </div>
  );
};

export default ArtifactsGallery;
