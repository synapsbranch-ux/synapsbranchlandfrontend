import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';

const GitGraph = ({ conversationId }) => {
  const { treeData, loadingTree, fetchTree, setCurrentBranch, currentBranch } = useStore();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 50, y: 50 });

  useEffect(() => {
    if (conversationId) {
      fetchTree(conversationId);
    }
  }, [conversationId, fetchTree]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  if (loadingTree) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading Git Graph...</span>
      </div>
    );
  }

  if (!treeData || !treeData.nodes || treeData.nodes.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No messages yet
      </div>
    );
  }

  // Build tree structure
  const { nodes, edges } = treeData;
  const nodeMap = {};
  nodes.forEach((n) => (nodeMap[n.id] = n));

  // Calculate positions using a simple layout algorithm
  const branchLanes = {};
  let laneCount = 0;
  const positions = {};
  const sortedNodes = [...nodes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  sortedNodes.forEach((node, idx) => {
    if (!branchLanes[node.branch_name]) {
      branchLanes[node.branch_name] = laneCount++;
    }
    positions[node.id] = {
      x: 100 + idx * 80,
      y: 60 + branchLanes[node.branch_name] * 60,
    };
  });

  const width = Math.max(600, sortedNodes.length * 80 + 200);
  const height = Math.max(200, laneCount * 60 + 100);

  return (
    <div className="relative h-64 overflow-hidden bg-background/50" ref={containerRef}>
      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground ml-2">{Math.round(scale * 100)}%</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-xs z-10">
        <div className="text-muted-foreground uppercase tracking-wider mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-foreground rounded-full" />
            <span>User Message</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-transparent border-2 border-foreground rounded-full" />
            <span>AI Response</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[hsl(239,84%,67%)] rounded-full" />
            <span>Branch Head</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 border-t-2 border-dashed border-muted-foreground" />
            <span>Fork Point</span>
          </div>
        </div>
      </div>

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Branch lane labels */}
        {Object.entries(branchLanes).map(([name, lane]) => (
          <text
            key={name}
            x={20}
            y={60 + lane * 60 + 4}
            className="text-xs fill-muted-foreground"
            style={{ fontSize: '11px' }}
          >
            {name}
          </text>
        ))}

        {/* Edges */}
        {edges.map((edge, idx) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;

          const fromNode = nodeMap[edge.from];
          const toNode = nodeMap[edge.to];
          const isFork = fromNode?.branch_name !== toNode?.branch_name;

          return (
            <line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isFork ? 'hsl(239 84% 67%)' : 'hsl(var(--muted-foreground))'}
              strokeWidth={2}
              strokeDasharray={isFork ? '5,5' : undefined}
              className="git-line"
            />
          );
        })}

        {/* Nodes */}
        {sortedNodes.map((node, idx) => {
          const pos = positions[node.id];
          const isUser = node.role === 'user';
          const isHead = idx === sortedNodes.filter((n) => n.branch_name === node.branch_name).length - 1;
          const isCurrentBranch = node.branch_name === currentBranch;

          return (
            <g
              key={node.id}
              className="git-node cursor-pointer"
              onClick={() => setCurrentBranch(node.branch_name)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHead ? 8 : 6}
                fill={isHead ? 'hsl(239 84% 67%)' : isUser ? 'hsl(var(--foreground))' : 'transparent'}
                stroke={isUser ? 'none' : 'hsl(var(--foreground))'}
                strokeWidth={2}
              />
              {/* Tooltip on hover */}
              <title>{`${node.role}: ${node.content.substring(0, 50)}...`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GitGraph;
