import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNodeData } from '@/types';
import { useMindMapStore } from '@/store/mindMapStore';
import { NodeWrapper } from './NodeWrapper';
import { EditableLabel } from './EditableLabel';
import { CollapseToggle } from './CollapseToggle';

export function SubtopicNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindMapNodeData;
  const hasChildren = useMindMapStore((s) => s.edges.some((e) => e.source === id));
  const isDropTarget = useMindMapStore((s) => s.dropTargetId === id);

  return (
    <NodeWrapper type="subtopic" selected={!!selected} isDropTarget={isDropTarget}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-sm font-medium" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <CollapseToggle nodeId={id} collapsed={!!nodeData.collapsed} hasChildren={hasChildren} nodeType="subtopic" />
    </NodeWrapper>
  );
}
