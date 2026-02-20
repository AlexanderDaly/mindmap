import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMindMapStore } from '@/store/mindMapStore';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { Toolbar } from './Toolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePersistence } from '@/hooks/usePersistence';

const DROP_PROXIMITY = 60;

export function MindMapCanvas() {
  const { screenToFlowPosition } = useReactFlow();
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
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(position);
    },
    [addNode, screenToFlowPosition],
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
    <div className="w-screen h-screen" style={{ background: '#0C2B1E' }}>
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
          gap={28}
          size={1}
          color="rgba(29, 196, 126, 0.07)"
        />
        <Controls
          showInteractive={false}
          className="!bg-[rgba(17,17,17,0.8)] !border-white/6 !rounded-xl [&>button]:!bg-transparent [&>button]:!border-white/6 [&>button]:!text-white/40 [&>button:hover]:!bg-white/5"
        />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'root': return '#1DC47E';
              case 'topic': return '#F0EBE0';
              case 'subtopic': return 'rgba(255, 255, 255, 0.5)';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(12, 43, 30, 0.8)"
          className="!bg-[rgba(17,17,17,0.75)] !border-white/6 !rounded-xl"
        />
        <Toolbar />
      </ReactFlow>
    </div>
  );
}
