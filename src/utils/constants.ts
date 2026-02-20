import type { MindMapNodeType } from '@/types';

export const NODE_COLORS: Record<MindMapNodeType, { glow: string; border: string; text: string; handle: string; handleBorder: string }> = {
  root: {
    glow: 'rgba(29, 196, 126, 0.35)',
    border: 'rgba(29, 196, 126, 0.6)',
    text: '#FFFFFF',
    handle: '#1DC47E',
    handleBorder: '#0C2B1E',
  },
  topic: {
    glow: 'rgba(240, 235, 224, 0.18)',
    border: 'rgba(240, 235, 224, 0.4)',
    text: '#F0EBE0',
    handle: '#F0EBE0',
    handleBorder: '#0C2B1E',
  },
  subtopic: {
    glow: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.25)',
    text: 'rgba(255, 255, 255, 0.85)',
    handle: 'rgba(255, 255, 255, 0.6)',
    handleBorder: '#0C2B1E',
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
