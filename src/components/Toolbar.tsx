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
      className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/70"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-white/10" />;
}

export function Toolbar() {
  const { fitView } = useReactFlow();
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
    addNode({ x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 });
  }, [addNode]);

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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-4 py-2 rounded-2xl"
      style={{
        background: 'rgba(15, 15, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Document name */}
      <input
        value={docName}
        onChange={(e) => setDocName(e.target.value)}
        className="bg-transparent border-none outline-none text-white/80 text-sm font-medium w-40 mr-2 focus:text-white"
        placeholder="Untitled"
      />

      <Divider />

      <ToolbarButton onClick={() => undo()} title="Undo (Ctrl+Z)" disabled={!canUndo}>
        <Undo2 size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => redo()} title="Redo (Ctrl+Shift+Z)" disabled={!canRedo}>
        <Redo2 size={18} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={handleAdd} title="Add Node">
        <Plus size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => layout()} title="Auto Layout">
        <LayoutGrid size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={toggleDirection} title={`Layout: ${layoutDirection === 'TB' ? 'Top-Down' : 'Left-Right'}`}>
        {layoutDirection === 'TB' ? <ArrowDownUp size={18} /> : <ArrowLeftRight size={18} />}
      </ToolbarButton>

      <ToolbarButton onClick={() => fitView({ padding: 0.2, duration: 300 })} title="Fit View">
        <Maximize size={18} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={handleExport} title="Export JSON">
        <Download size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Import JSON">
        <Upload size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => { save(); }} title="Save (Ctrl+S)">
        <Save size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => newDoc()} title="New Mind Map">
        <FileText size={18} />
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
