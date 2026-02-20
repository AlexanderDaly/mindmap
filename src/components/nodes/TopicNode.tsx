import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNodeData } from '@/types';
import { useMindMapStore } from '@/store/mindMapStore';
import { NodeWrapper } from './NodeWrapper';
import { EditableLabel } from './EditableLabel';
import { CollapseToggle } from './CollapseToggle';

export function TopicNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindMapNodeData;
  const hasChildren = useMindMapStore((s) => s.edges.some((e) => e.source === id));
  const isDropTarget = useMindMapStore((s) => s.dropTargetId === id);

  return (
    <NodeWrapper type="topic" selected={!!selected} isDropTarget={isDropTarget}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-base font-semibold" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <CollapseToggle nodeId={id} collapsed={!!nodeData.collapsed} hasChildren={hasChildren} nodeType="topic" />
    </NodeWrapper>
  );
}
