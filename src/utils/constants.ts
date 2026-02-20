import type { MindMapNodeType } from '@/types';

export const NODE_COLORS: Record<MindMapNodeType, { glow: string; border: string; text: string }> = {
  root: {
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'rgba(168, 85, 247, 0.6)',
    text: '#e9d5ff',
  },
  topic: {
    glow: 'rgba(59, 130, 246, 0.4)',
    border: 'rgba(59, 130, 246, 0.6)',
    text: '#dbeafe',
  },
  subtopic: {
    glow: 'rgba(34, 211, 238, 0.35)',
    border: 'rgba(34, 211, 238, 0.5)',
    text: '#cffafe',
  },
};

export const DEFAULT_ROOT_NODE = {
  id: 'root',
  type: 'root',
  position: { x: 0, y: 0 },
  data: { label: 'Central Idea', type: 'root' as const },
};

export const STORAGE_KEY = 'mindmap-documents';
export const ACTIVE_DOC_KEY = 'mindmap-active-doc';

export const LAYOUT_DEFAULTS = {
  rankSep: 100,
  nodeSep: 60,
  nodeWidth: 200,
  nodeHeight: 60,
};
