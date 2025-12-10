import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MindMapViewer = ({ workspaceId, onClose }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [], created_at: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const graphRef = useRef();

    const fetchMindMap = useCallback(async (force = false) => {
        if (!workspaceId) {
            setError('No workspace selected');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/workspaces/${workspaceId}/mindmap?force_refresh=${force}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Transform backend data to force-graph format
            const nodes = (res.data.nodes || [])
                .filter(node => node && node.id) // Filter invalid nodes
                .map(node => ({
                    id: String(node.id), // Ensure string ID
                    name: node.name || node.label || String(node.id),
                    val: node.val || 15,
                    color: node.color || '#8b5cf6' // Purple for visibility
                }));

            // Create a Set of valid node IDs for O(1) lookup
            const nodeIds = new Set(nodes.map(n => n.id));

            const links = (res.data.edges || [])
                .filter(edge => {
                    const sourceId = String(edge.source || edge.from || '');
                    const targetId = String(edge.target || edge.to || '');
                    return sourceId && targetId && nodeIds.has(sourceId) && nodeIds.has(targetId);
                })
                .map(edge => ({
                    source: String(edge.source || edge.from),
                    target: String(edge.target || edge.to),
                    label: edge.label || ''
                }));

            setGraphData({
                nodes,
                links,
                created_at: res.data.created_at
            });
            setLoading(false);
        } catch (e) {
            console.error('Failed to fetch mind map:', e);
            setError(e.response?.data?.detail || e.message);
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchMindMap();
    }, [fetchMindMap]);

    const handleZoomIn = () => {
        if (graphRef.current) {
            graphRef.current.zoom(graphRef.current.zoom() * 1.2);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            graphRef.current.zoom(graphRef.current.zoom() / 1.2);
        }
    };

    const handleFitView = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify({ nodes: graphData.nodes, links: graphData.links }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mindmap-${workspaceId}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-[var(--z-modal)]">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Mind Map</h2>
                        {graphData.created_at && (
                            <span className="text-xs text-slate-400">
                                Updated: {new Date(graphData.created_at).toLocaleString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchMindMap(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                            title="Regenerate"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                            title="Export"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-1" />
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-slate-800 text-white rounded-lg transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-slate-800 text-white rounded-lg transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleFitView}
                            className="p-2 hover:bg-slate-800 text-white rounded-lg transition-colors"
                            title="Fit to View"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-1" />
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Graph Canvas */}
                <div className="flex-1 relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                                <span className="text-sm font-medium text-slate-300 animate-pulse">
                                    Generating Mind Map...
                                </span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
                                <p className="text-red-400">{error}</p>
                                <button
                                    onClick={() => fetchMindMap(true)}
                                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && graphData.nodes.length > 0 && (
                        <ForceGraph2D
                            ref={graphRef}
                            graphData={graphData}
                            nodeLabel="name"
                            nodeCanvasObject={(node, ctx, globalScale) => {
                                const label = node.name || '';
                                const fontSize = Math.max(12 / globalScale, 4);
                                ctx.font = `bold ${fontSize}px Inter, sans-serif`;

                                // Draw node circle
                                ctx.fillStyle = node.color || '#8b5cf6';
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, node.val || 10, 0, 2 * Math.PI, false);
                                ctx.fill();

                                // Draw white border
                                ctx.strokeStyle = '#ffffff';
                                ctx.lineWidth = 2 / globalScale;
                                ctx.stroke();

                                // Draw label
                                const textWidth = ctx.measureText(label).width;
                                const padding = 4 / globalScale;
                                const labelY = node.y + (node.val || 10) + fontSize + 2;

                                // Label background
                                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                                ctx.fillRect(
                                    node.x - textWidth / 2 - padding,
                                    labelY - fontSize / 2 - padding,
                                    textWidth + padding * 2,
                                    fontSize + padding * 2
                                );

                                // Label text
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = '#ffffff';
                                ctx.fillText(label, node.x, labelY);
                            }}
                            linkColor={() => '#64748b'}
                            linkWidth={2}
                            linkDirectionalArrowLength={6}
                            linkDirectionalArrowRelPos={1}
                            linkCurvature={0.2}
                            backgroundColor="#0f172a"
                            width={window.innerWidth}
                            height={window.innerHeight - 70}
                        />
                    )}

                    {!loading && !error && graphData.nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-slate-400">
                                <p className="text-lg">No data to visualize</p>
                                <p className="text-sm mt-2">Start a conversation in this workspace first.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MindMapViewer;
