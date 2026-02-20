import { useMindMapStore } from '@/store/mindMapStore';
import type { MindMapNodeType } from '@/types';

type CollapseToggleProps = {
  nodeId: string;
  collapsed: boolean;
  hasChildren: boolean;
  nodeType: MindMapNodeType;
};

export function CollapseToggle({ nodeId, collapsed, hasChildren }: CollapseToggleProps) {
  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);
  const layoutDirection = useMindMapStore((s) => s.layoutDirection);

  if (!hasChildren) return null;

  const isLR = layoutDirection === 'LR';

  const positionClass = isLR
    ? 'top-1/2 -right-3 -translate-y-1/2'
    : '-bottom-3 left-1/2 -translate-x-1/2';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleCollapse(nodeId);
      }}
      className={`absolute ${positionClass} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 hover:scale-110 cursor-pointer z-10`}
      style={{
        background: '#111111',
        border: '1.5px solid rgba(29, 196, 126, 0.5)',
        color: '#1DC47E',
        boxShadow: '0 0 8px rgba(29, 196, 126, 0.25)',
      }}
      title={collapsed ? 'Expand children' : 'Collapse children'}
    >
      {collapsed ? '+' : '\u2212'}
    </button>
  );
}
