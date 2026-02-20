import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMindMapStore } from '@/store/mindMapStore';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { Toolbar } from './Toolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePersistence } from '@/hooks/usePersistence';

export function MindMapCanvas() {
  const nodes = useMindMapStore((s) => s.nodes);
  const edges = useMindMapStore((s) => s.edges);
  const onNodesChange = useMindMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMindMapStore((s) => s.onEdgesChange);
  const onConnect = useMindMapStore((s) => s.onConnect);
  const addNode = useMindMapStore((s) => s.addNode);

  useKeyboardShortcuts();
  usePersistence();

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Get the canvas position from screen coordinates
      // We need the ReactFlow instance for this, but we can calculate from the event
      const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!bounds) return;

      // Use a simpler approach - add at a viewport-relative position
      addNode({ x: event.clientX - bounds.left - 100, y: event.clientY - bounds.top - 30 });
    },
    [addNode],
  );

  const handleNodeDragStop: OnNodeDrag = useCallback(() => {
    // auto-save triggers from state change
  }, []);

  return (
    <div className="w-screen h-screen" style={{ background: '#0a0a14' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDoubleClick={handlePaneDoubleClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'animatedEdge' }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="mindmap-flow"
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode="Shift"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="rgba(255, 255, 255, 0.06)"
        />
        <Controls
          showInteractive={false}
          className="!bg-[rgba(15,15,25,0.7)] !border-white/10 !rounded-xl [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-white/60 [&>button:hover]:!bg-white/10"
        />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'root': return '#a855f7';
              case 'topic': return '#3b82f6';
              case 'subtopic': return '#22d3ee';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-[rgba(15,15,25,0.8)] !border-white/10 !rounded-xl"
        />
        <Toolbar />
      </ReactFlow>
    </div>
  );
}
