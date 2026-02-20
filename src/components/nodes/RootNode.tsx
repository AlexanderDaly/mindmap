import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNodeData } from '@/types';
import { useMindMapStore } from '@/store/mindMapStore';
import { NodeWrapper } from './NodeWrapper';
import { EditableLabel } from './EditableLabel';
import { CollapseToggle } from './CollapseToggle';

export function RootNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindMapNodeData;
  const hasChildren = useMindMapStore((s) => s.edges.some((e) => e.source === id));
  const isDropTarget = useMindMapStore((s) => s.dropTargetId === id);

  const h = "!w-2.5 !h-2.5 !border-2 !border-[#0C2B1E]" as const;

  return (
    <NodeWrapper type="root" selected={!!selected} isDropTarget={isDropTarget}>
      <EditableLabel nodeId={id} label={nodeData.label} className="text-lg font-bold tracking-tight" />
      <Handle type="source" position={Position.Bottom} className={`!bg-[#1DC47E] ${h}`} />
      <Handle type="source" position={Position.Right} id="right" className={`!bg-[#1DC47E] ${h}`} />
      <Handle type="source" position={Position.Left} id="left" className={`!bg-[#1DC47E] ${h}`} />
      <Handle type="source" position={Position.Top} id="top" className={`!bg-[#1DC47E] ${h}`} />
      <CollapseToggle nodeId={id} collapsed={!!nodeData.collapsed} hasChildren={hasChildren} nodeType="root" />
    </NodeWrapper>
  );
}
