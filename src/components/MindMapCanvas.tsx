import { useCallback, useRef } from 'react';
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

const DROP_PROXIMITY = 60; // pixels in flow coordinates

export function MindMapCanvas() {
  const getVisibleNodes = useMindMapStore((s) => s.getVisibleNodes);
  const getVisibleEdges = useMindMapStore((s) => s.getVisibleEdges);
  const onNodesChange = useMindMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMindMapStore((s) => s.onEdgesChange);
  const onConnect = useMindMapStore((s) => s.onConnect);
  const addNode = useMindMapStore((s) => s.addNode);
  const setDropTarget = useMindMapStore((s) => s.setDropTarget);
  const reparentNode = useMindMapStore((s) => s.reparentNode);

  const visibleNodes = getVisibleNodes();
  const visibleEdges = getVisibleEdges();

  const draggedNodeId = useRef<string | null>(null);

  useKeyboardShortcuts();
  usePersistence();

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!bounds) return;
      addNode({ x: event.clientX - bounds.left - 100, y: event.clientY - bounds.top - 30 });
    },
    [addNode],
  );

  const findDropTarget = useCallback(
    (dragNodeId: string, dragX: number, dragY: number) => {
      const nodes = useMindMapStore.getState().getVisibleNodes();
      for (const node of nodes) {
        if (node.id === dragNodeId) continue;
        const dx = node.position.x - dragX;
        const dy = node.position.y - dragY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DROP_PROXIMITY) return node.id;
      }
      return null;
    },
    [],
  );

  const handleNodeDragStart: OnNodeDrag = useCallback((_event, node) => {
    draggedNodeId.current = node.id;
  }, []);

  const handleNodeDrag: OnNodeDrag = useCallback(
    (_event, node) => {
      const targetId = findDropTarget(node.id, node.position.x, node.position.y);
      setDropTarget(targetId);
    },
    [findDropTarget, setDropTarget],
  );

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_event, _node) => {
      const targetId = useMindMapStore.getState().dropTargetId;
      if (targetId && draggedNodeId.current) {
        reparentNode(draggedNodeId.current, targetId);
      }
      setDropTarget(null);
      draggedNodeId.current = null;
    },
    [reparentNode, setDropTarget],
  );

  return (
    <div className="w-screen h-screen" style={{ background: '#0a0a14' }}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDoubleClick={handlePaneDoubleClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
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
