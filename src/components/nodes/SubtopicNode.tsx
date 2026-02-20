import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNodeData } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { EditableLabel } from './EditableLabel';

export function SubtopicNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindMapNodeData;
  return (
    <NodeWrapper type="subtopic" selected={!!selected}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-sm font-medium" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-cyan-600" />
    </NodeWrapper>
  );
}
