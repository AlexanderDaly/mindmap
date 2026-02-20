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

  const h = "!w-2 !h-2 !border-2 !border-[#0C2B1E]" as const;

  return (
    <NodeWrapper type="topic" selected={!!selected} isDropTarget={isDropTarget}>
      <Handle type="target" position={Position.Top} className={`!bg-[#F0EBE0] ${h}`} />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-base font-medium" />
      <Handle type="source" position={Position.Bottom} className={`!bg-[#F0EBE0] ${h}`} />
      <Handle type="target" position={Position.Left} id="left" className={`!bg-[#F0EBE0] ${h}`} />
      <Handle type="source" position={Position.Right} id="right" className={`!bg-[#F0EBE0] ${h}`} />
      <CollapseToggle nodeId={id} collapsed={!!nodeData.collapsed} hasChildren={hasChildren} nodeType="topic" />
    </NodeWrapper>
  );
}
