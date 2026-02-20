import dagre from '@dagrejs/dagre';
import type { MindMapNode, MindMapEdge, LayoutDirection } from '@/types';
import { LAYOUT_DEFAULTS } from './constants';

export function getLayoutedElements(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  direction: LayoutDirection = 'TB',
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: LAYOUT_DEFAULTS.rankSep,
    nodesep: LAYOUT_DEFAULTS.nodeSep,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: LAYOUT_DEFAULTS.nodeWidth,
      height: LAYOUT_DEFAULTS.nodeHeight,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - LAYOUT_DEFAULTS.nodeWidth / 2,
        y: pos.y - LAYOUT_DEFAULTS.nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
