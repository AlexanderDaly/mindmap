import type { Node, Edge } from '@xyflow/react';

export type MindMapNodeType = 'root' | 'topic' | 'subtopic';

export type MindMapNodeData = {
  label: string;
  type: MindMapNodeType;
  collapsed?: boolean;
};

export type MindMapNode = Node<MindMapNodeData, string>;
export type MindMapEdge = Edge;

export type LayoutDirection = 'TB' | 'LR';

export type MindMapDocument = {
  id: string;
  name: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updatedAt: number;
};
