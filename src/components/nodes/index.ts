import type { NodeTypes } from '@xyflow/react';
import { RootNode } from './RootNode';
import { TopicNode } from './TopicNode';
import { SubtopicNode } from './SubtopicNode';

export const nodeTypes: NodeTypes = {
  root: RootNode,
  topic: TopicNode,
  subtopic: SubtopicNode,
};
