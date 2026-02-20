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

  const h = "!w-2 !h-2 !border-2 !border-[#0C2B1E]" as const;

  return (
    <NodeWrapper type="subtopic" selected={!!selected} isDropTarget={isDropTarget}>
      <Handle type="target" position={Position.Top} className={`!bg-white/60 ${h}`} />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-sm font-light" />
      <Handle type="source" position={Position.Bottom} className={`!bg-white/60 ${h}`} />
      <Handle type="target" position={Position.Left} id="left" className={`!bg-white/60 ${h}`} />
      <Handle type="source" position={Position.Right} id="right" className={`!bg-white/60 ${h}`} />
      <CollapseToggle nodeId={id} collapsed={!!nodeData.collapsed} hasChildren={hasChildren} nodeType="subtopic" />
    </NodeWrapper>
  );
}
