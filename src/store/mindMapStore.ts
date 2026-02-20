import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { MindMapNode, MindMapEdge, MindMapNodeType, LayoutDirection } from '@/types';
import { DEFAULT_ROOT_NODE } from '@/utils/constants';
import { getLayoutedElements } from '@/utils/layout';
import { saveDocument, loadDocuments, getActiveDocId, setActiveDocId } from '@/utils/storage';

type MindMapState = {
  docId: string;
  docName: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layoutDirection: LayoutDirection;

  onNodesChange: OnNodesChange<MindMapNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (position: { x: number; y: number }, type?: MindMapNodeType, label?: string) => string;
  addChild: (parentId: string) => void;
  addSibling: (nodeId: string) => void;
  deleteSelected: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  setNodes: (nodes: MindMapNode[]) => void;
  setEdges: (edges: MindMapEdge[]) => void;

  autoLayout: (direction?: LayoutDirection) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;

  save: () => void;
  loadDoc: (docId: string) => void;
  newDoc: (name?: string) => void;
  setDocName: (name: string) => void;
  importData: (name: string, nodes: MindMapNode[], edges: MindMapEdge[]) => void;

  toggleCollapse: (nodeId: string) => void;
  getVisibleNodes: () => MindMapNode[];
  getVisibleEdges: () => MindMapEdge[];

  dropTargetId: string | null;
  setDropTarget: (nodeId: string | null) => void;
  reparentNode: (nodeId: string, newParentId: string) => void;
};

/** Collect all node IDs that are hidden because an ancestor is collapsed. */
function getHiddenNodeIds(nodes: MindMapNode[], edges: MindMapEdge[]): Set<string> {
  const collapsedIds = new Set(nodes.filter((n) => n.data.collapsed).map((n) => n.id));
  const hidden = new Set<string>();
  // Build adjacency: parent -> children
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) ?? [];
    list.push(edge.target);
    children.set(edge.source, list);
  }
  // BFS from each collapsed node to hide all descendants
  const queue: string[] = [];
  for (const id of collapsedIds) {
    for (const child of children.get(id) ?? []) {
      queue.push(child);
    }
  }
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (hidden.has(id)) continue;
    hidden.add(id);
    for (const child of children.get(id) ?? []) {
      queue.push(child);
    }
  }
  return hidden;
}

/** Check if `descendantId` is a descendant of `ancestorId` via edges. */
function isDescendant(ancestorId: string, descendantId: string, edges: MindMapEdge[]): boolean {
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) ?? [];
    list.push(edge.target);
    children.set(edge.source, list);
  }
  const visited = new Set<string>();
  const queue = [ancestorId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (id === descendantId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const child of children.get(id) ?? []) {
      queue.push(child);
    }
  }
  return false;
}

function createDefaultDoc() {
  const id = nanoid();
  return { id, name: 'Untitled Mind Map', nodes: [{ ...DEFAULT_ROOT_NODE }], edges: [] as MindMapEdge[] };
}

function initState() {
  const docs = loadDocuments();
  const activeId = getActiveDocId();
  const doc = docs.find((d) => d.id === activeId) ?? docs[0];
  if (doc) {
    return { docId: doc.id, docName: doc.name, nodes: doc.nodes, edges: doc.edges };
  }
  const newDoc = createDefaultDoc();
  return { docId: newDoc.id, docName: newDoc.name, nodes: newDoc.nodes, edges: newDoc.edges };
}

export const useMindMapStore = create<MindMapState>()(
  temporal(
    (set, get) => {
  const initial = initState();

  return {
    docId: initial.docId,
    docName: initial.docName,
    nodes: initial.nodes,
    edges: initial.edges,
    layoutDirection: 'TB' as LayoutDirection,

    onNodesChange: (changes: NodeChange<MindMapNode>[]) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection: Connection) => {
      set({ edges: addEdge({ ...connection, type: 'animatedEdge' }, get().edges) });
    },

    addNode: (position, type = 'topic', label) => {
      const id = nanoid(8);
      const newNode: MindMapNode = {
        id,
        type,
        position,
        data: { label: label ?? (type === 'root' ? 'Central Idea' : type === 'topic' ? 'New Topic' : 'Subtopic'), type },
      };
      set({ nodes: [...get().nodes, newNode] });
      return id;
    },

    addChild: (parentId) => {
      const parent = get().nodes.find((n) => n.id === parentId);
      if (!parent) return;

      const parentType = parent.data.type;
      const childType: MindMapNodeType = parentType === 'root' ? 'topic' : 'subtopic';
      const childLabel = childType === 'topic' ? 'New Topic' : 'Subtopic';

      const childId = nanoid(8);
      const isLR = get().layoutDirection === 'LR';
      const newNode: MindMapNode = {
        id: childId,
        type: childType,
        position: isLR
          ? { x: parent.position.x + 250, y: parent.position.y }
          : { x: parent.position.x, y: parent.position.y + 120 },
        data: { label: childLabel, type: childType },
      };

      const newEdge: MindMapEdge = {
        id: `e-${parentId}-${childId}`,
        source: parentId,
        target: childId,
        type: 'animatedEdge',
      };

      set({
        nodes: [...get().nodes, newNode],
        edges: [...get().edges, newEdge],
      });
    },

    addSibling: (nodeId) => {
      const { nodes, edges } = get();
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (!parentEdge) return;

      const currentNode = nodes.find((n) => n.id === nodeId);
      if (!currentNode) return;

      const siblingId = nanoid(8);
      const siblingType = currentNode.data.type;
      const isLR = get().layoutDirection === 'LR';
      const newNode: MindMapNode = {
        id: siblingId,
        type: siblingType,
        position: isLR
          ? { x: currentNode.position.x, y: currentNode.position.y + 100 }
          : { x: currentNode.position.x + 220, y: currentNode.position.y },
        data: { label: siblingType === 'topic' ? 'New Topic' : 'Subtopic', type: siblingType },
      };

      const newEdge: MindMapEdge = {
        id: `e-${parentEdge.source}-${siblingId}`,
        source: parentEdge.source,
        target: siblingId,
        type: 'animatedEdge',
      };

      set({
        nodes: [...nodes, newNode],
        edges: [...edges, newEdge],
      });
    },

    deleteSelected: () => {
      const { nodes, edges } = get();
      const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
      const selectedEdgeIds = new Set(edges.filter((e) => e.selected).map((e) => e.id));

      // Don't delete the root node
      if (selectedNodeIds.has('root')) {
        selectedNodeIds.delete('root');
      }

      // Collect all descendant nodes to delete
      const toDelete = new Set(selectedNodeIds);
      let changed = true;
      while (changed) {
        changed = false;
        for (const edge of edges) {
          if (toDelete.has(edge.source) && !toDelete.has(edge.target)) {
            toDelete.add(edge.target);
            changed = true;
          }
        }
      }

      set({
        nodes: nodes.filter((n) => !toDelete.has(n.id)),
        edges: edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target) && !selectedEdgeIds.has(e.id)),
      });
    },

    updateNodeLabel: (nodeId, label) => {
      set({
        nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n)),
      });
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    autoLayout: (direction) => {
      const dir = direction ?? get().layoutDirection;
      const allNodes = get().nodes;
      const allEdges = get().edges;
      const hidden = getHiddenNodeIds(allNodes, allEdges);
      const visibleNodes = allNodes.filter((n) => !hidden.has(n.id));
      const visibleEdges = allEdges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target));
      const layouted = getLayoutedElements(visibleNodes, visibleEdges, dir);
      // Merge layouted positions back, keep hidden nodes as-is
      const posMap = new Map(layouted.nodes.map((n) => [n.id, n.position]));
      const mergedNodes = allNodes.map((n) => {
        const pos = posMap.get(n.id);
        return pos ? { ...n, position: pos } : n;
      });
      set({ nodes: mergedNodes, edges: allEdges, layoutDirection: dir });
    },

    setLayoutDirection: (direction) => set({ layoutDirection: direction }),

    save: () => {
      const { docId, docName, nodes, edges } = get();
      saveDocument({ id: docId, name: docName, nodes, edges, updatedAt: Date.now() });
      setActiveDocId(docId);
    },

    loadDoc: (docId) => {
      const docs = loadDocuments();
      const doc = docs.find((d) => d.id === docId);
      if (doc) {
        set({ docId: doc.id, docName: doc.name, nodes: doc.nodes, edges: doc.edges });
        setActiveDocId(docId);
      }
    },

    newDoc: (name) => {
      // Save current document before creating a new one
      const { docId, docName, nodes, edges } = get();
      saveDocument({ id: docId, name: docName, nodes, edges, updatedAt: Date.now() });

      const doc = createDefaultDoc();
      if (name) doc.name = name;
      set({ docId: doc.id, docName: doc.name, nodes: doc.nodes, edges: doc.edges });
      setActiveDocId(doc.id);
    },

    setDocName: (name) => set({ docName: name }),

    importData: (name, nodes, edges) => {
      const id = nanoid();
      set({ docId: id, docName: name, nodes, edges });
      setActiveDocId(id);
    },

    toggleCollapse: (nodeId) => {
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } } : n,
        ),
      });
    },

    getVisibleNodes: () => {
      const { nodes, edges } = get();
      const hidden = getHiddenNodeIds(nodes, edges);
      return nodes.filter((n) => !hidden.has(n.id));
    },

    getVisibleEdges: () => {
      const { nodes, edges } = get();
      const hidden = getHiddenNodeIds(nodes, edges);
      return edges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target));
    },

    dropTargetId: null,
    setDropTarget: (nodeId) => set({ dropTargetId: nodeId }),

    reparentNode: (nodeId, newParentId) => {
      const { nodes, edges } = get();
      // Guard: can't reparent root, can't parent to self
      if (nodeId === 'root' || nodeId === newParentId) return;
      // Guard: can't make a node a child of its own descendant (cycle)
      if (isDescendant(nodeId, newParentId, edges)) return;
      // Guard: already parented to this node
      const existingEdge = edges.find((e) => e.target === nodeId);
      if (existingEdge?.source === newParentId) return;

      // Determine new node type based on new parent
      const newParent = nodes.find((n) => n.id === newParentId);
      if (!newParent) return;
      const newType: MindMapNodeType = newParent.data.type === 'root' ? 'topic' : 'subtopic';

      // Remove old incoming edge, add new one
      const newEdges = edges.filter((e) => e.target !== nodeId);
      newEdges.push({
        id: `e-${newParentId}-${nodeId}`,
        source: newParentId,
        target: nodeId,
        type: 'animatedEdge',
      });

      // Update the node's type to match its new depth
      const newNodes = nodes.map((n) =>
        n.id === nodeId ? { ...n, type: newType, data: { ...n.data, type: newType } } : n,
      );

      set({ nodes: newNodes, edges: newEdges });
    },
  };
    },
    {
      limit: 100,
      // Only track nodes and edges — not doc metadata or layout direction
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      // Return true when states are "equal" (i.e. skip saving to history).
      // Skip position-only / select-only changes so dragging doesn't flood history.
      equality: (pastState, currentState) => {
        if (pastState.edges !== currentState.edges) return false;
        if (pastState.nodes === currentState.nodes) return true;
        if (pastState.nodes.length !== currentState.nodes.length) return false;
        // Same nodes by count — check if only positions/selections changed (data unchanged)
        return pastState.nodes.every((pn, i) => {
          const cn = currentState.nodes[i];
          return pn.id === cn.id && pn.data === cn.data;
        });
      },
    },
  ),
);
