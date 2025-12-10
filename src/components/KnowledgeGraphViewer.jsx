import React, { useEffect, useState, useCallback } from 'react';
import Graph from 'react-graph-vis';
import { Loader2, Download, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KnowledgeGraphViewer = ({ workspaceId, onClose }) => {
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [createdAt, setCreatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [graphKey, setGraphKey] = useState(Date.now()); // Force remount key

    const fetchKnowledgeGraph = useCallback(async (force = false) => {
        if (!workspaceId) {
            setError('No workspace selected');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/workspaces/${workspaceId}/knowledge-graph?force_refresh=${force}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Transform backend data to vis-network format with strict validation
            const rawNodes = (res.data.nodes || [])
                .filter(node => {
                    // Strict validation: must have non-null, non-empty id
                    if (!node || node.id === null || node.id === undefined || node.id === '') {
                        console.warn('Filtering invalid node:', node);
                        return false;
                    }
                    return true;
                })
                .map(node => ({
                    id: String(node.id), // Force string ID
                    label: node.label || String(node.id),
                    title: node.description || node.label || String(node.id),
                    color: {
                        background: '#8b5cf6',
                        border: '#7c3aed',
                        highlight: { background: '#a78bfa', border: '#8b5cf6' }
                    },
                    shape: 'box',
                    font: {
                        color: '#ffffff',
                        size: 14,
                        face: 'Inter, sans-serif',
                        bold: true
                    },
                    margin: 10,
                    borderWidth: 2
                }));

            // Deduplicate nodes by ID
            const nodeMap = new Map();
            rawNodes.forEach(node => {
                if (!nodeMap.has(node.id)) {
                    nodeMap.set(node.id, node);
                }
            });
            const nodes = Array.from(nodeMap.values());
            const nodeIds = new Set(nodes.map(n => n.id));

            // Validate edges
            const edges = (res.data.edges || [])
                .filter(edge => {
                    const fromId = String(edge.from || '');
                    const toId = String(edge.to || '');
                    if (!fromId || !toId || !nodeIds.has(fromId) || !nodeIds.has(toId)) {
                        console.warn('Filtering invalid edge:', edge);
                        return false;
                    }
                    return true;
                })
                .map((edge, idx) => ({
                    id: `edge_${idx}`, // Unique edge ID
                    from: String(edge.from),
                    to: String(edge.to),
                    label: edge.relationship || edge.label || '',
                    arrows: 'to',
                    color: { color: '#64748b', highlight: '#94a3b8' },
                    font: { color: '#94a3b8', size: 10, strokeWidth: 0 }
                }));

            setGraphData({ nodes, edges });
            setCreatedAt(res.data.created_at);
            setGraphKey(Date.now()); // Force new graph instance
            setLoading(false);
        } catch (e) {
            console.error('Failed to fetch knowledge graph:', e);
            setError(e.response?.data?.detail || e.message);
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchKnowledgeGraph();
    }, [fetchKnowledgeGraph]);

    const options = {
        layout: {
            hierarchical: {
                enabled: false // Disable hierarchical for organic layout
            }
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -3000,
                centralGravity: 0.3,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.09
            },
            stabilization: {
                iterations: 150,
                fit: true
            }
        },
        edges: {
            smooth: {
                type: 'continuous',
                roundness: 0.5
            },
            width: 2
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true
        },
        nodes: {
            shape: 'box',
            margin: 10
        }
    };

    const events = {
        select: (event) => {
            const { nodes } = event;
            if (nodes.length > 0) {
                console.log('Selected node:', nodes[0]);
            }
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(graphData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge-graph-${workspaceId}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-[var(--z-modal)]">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white">Knowledge Graph</h2>
                        {createdAt && (
                            <span className="text-xs text-slate-400">
                                Updated: {new Date(createdAt).toLocaleString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search nodes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <button
                            onClick={() => fetchKnowledgeGraph(true)}
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
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Graph */}
                <div className="flex-1 relative" style={{ backgroundColor: '#0f172a' }}>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                                <span className="text-sm font-medium text-slate-300 animate-pulse">
                                    Extracting Knowledge...
                                </span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
                                <p className="text-red-400">{error}</p>
                                <button
                                    onClick={() => fetchKnowledgeGraph(true)}
                                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && graphData.nodes.length > 0 && (
                        <Graph
                            key={graphKey}
                            graph={graphData}
                            options={options}
                            events={events}
                            style={{ height: '100%', width: '100%' }}
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

export default KnowledgeGraphViewer;
