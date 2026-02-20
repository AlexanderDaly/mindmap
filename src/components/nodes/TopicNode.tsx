import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MindMapNodeData } from '@/types';
import { NodeWrapper } from './NodeWrapper';
import { EditableLabel } from './EditableLabel';

export function TopicNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MindMapNodeData;
  return (
    <NodeWrapper type="topic" selected={!!selected}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <EditableLabel nodeId={id} label={nodeData.label} className="text-base font-semibold" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-blue-400 !w-2 !h-2 !border-2 !border-blue-600" />
    </NodeWrapper>
  );
}
