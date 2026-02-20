import { useCallback, useRef } from 'react';
import { useStore } from 'zustand';
import { useReactFlow } from '@xyflow/react';
import {
  Plus,
  LayoutGrid,
  Maximize,
  Download,
  Upload,
  Save,
  FileText,
  ArrowDownUp,
  ArrowLeftRight,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useMindMapStore } from '@/store/mindMapStore';
import { useAutoLayout } from '@/hooks/useAutoLayout';
import { exportToJSON, importFromJSON } from '@/utils/export';

function ToolbarButton({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-2 rounded-lg text-white/50 hover:text-[#1DC47E] hover:bg-white/5 transition-all duration-150 cursor-pointer disabled:opacity-25 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/50"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/8" />;
}

export function Toolbar() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const addNode = useMindMapStore((s) => s.addNode);
  const save = useMindMapStore((s) => s.save);
  const docName = useMindMapStore((s) => s.docName);
  const setDocName = useMindMapStore((s) => s.setDocName);
  const nodes = useMindMapStore((s) => s.nodes);
  const edges = useMindMapStore((s) => s.edges);
  const importData = useMindMapStore((s) => s.importData);
  const newDoc = useMindMapStore((s) => s.newDoc);
  const { layout, toggleDirection, layoutDirection } = useAutoLayout();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { undo, redo } = useMindMapStore.temporal.getState();
  const canUndo = useStore(useMindMapStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useMindMapStore.temporal, (s) => s.futureStates.length > 0);

  const handleAdd = useCallback(() => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(center);
  }, [addNode, screenToFlowPosition]);

  const handleExport = useCallback(() => {
    exportToJSON(docName, nodes, edges);
  }, [docName, nodes, edges]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      importData(data.name, data.nodes, data.edges);
    } catch {
      // silently fail on invalid import
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [importData]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-4 py-1.5 rounded-2xl"
      style={{
        background: 'rgba(17, 17, 17, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(29, 196, 126, 0.05)',
      }}
    >
      {/* Document name */}
      <input
        value={docName}
        onChange={(e) => setDocName(e.target.value)}
        className="bg-transparent border-none outline-none text-white/70 text-sm font-medium w-40 mr-2 focus:text-[#1DC47E] transition-colors"
        style={{ letterSpacing: '-0.02em' }}
        placeholder="Untitled"
      />

      <Divider />

      <ToolbarButton onClick={() => undo()} title="Undo (Ctrl+Z)" disabled={!canUndo}>
        <Undo2 size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => redo()} title="Redo (Ctrl+Shift+Z)" disabled={!canRedo}>
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={handleAdd} title="Add Node">
        <Plus size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => layout()} title="Auto Layout">
        <LayoutGrid size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={toggleDirection} title={`Layout: ${layoutDirection === 'TB' ? 'Top-Down' : 'Left-Right'}`}>
        {layoutDirection === 'TB' ? <ArrowDownUp size={16} /> : <ArrowLeftRight size={16} />}
      </ToolbarButton>

      <ToolbarButton onClick={() => fitView({ padding: 0.2, duration: 300 })} title="Fit View">
        <Maximize size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={handleExport} title="Export JSON">
        <Download size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Import JSON">
        <Upload size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => { save(); }} title="Save (Ctrl+S)">
        <Save size={16} />
      </ToolbarButton>

      <ToolbarButton onClick={() => newDoc()} title="New Mind Map">
        <FileText size={16} />
      </ToolbarButton>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
