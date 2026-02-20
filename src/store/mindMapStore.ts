import { create } from 'zustand';
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
};

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

export const useMindMapStore = create<MindMapState>((set, get) => {
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
      const newNode: MindMapNode = {
        id: childId,
        type: childType,
        position: { x: parent.position.x, y: parent.position.y + 120 },
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
      const newNode: MindMapNode = {
        id: siblingId,
        type: siblingType,
        position: { x: currentNode.position.x + 220, y: currentNode.position.y },
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
      const { nodes, edges } = getLayoutedElements(get().nodes, get().edges, dir);
      set({ nodes, edges, layoutDirection: dir });
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
  };
});
