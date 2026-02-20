import { useMindMapStore } from '@/store/mindMapStore';
import type { MindMapNodeType } from '@/types';
import { NODE_COLORS } from '@/utils/constants';

type CollapseToggleProps = {
  nodeId: string;
  collapsed: boolean;
  hasChildren: boolean;
  nodeType: MindMapNodeType;
};

export function CollapseToggle({ nodeId, collapsed, hasChildren, nodeType }: CollapseToggleProps) {
  const toggleCollapse = useMindMapStore((s) => s.toggleCollapse);

  if (!hasChildren) return null;

  const colors = NODE_COLORS[nodeType];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleCollapse(nodeId);
      }}
      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 hover:scale-110 cursor-pointer z-10"
      style={{
        background: 'rgba(15, 15, 25, 0.9)',
        border: `1.5px solid ${colors.border}`,
        color: colors.text,
        boxShadow: `0 0 8px ${colors.glow}`,
      }}
      title={collapsed ? 'Expand children' : 'Collapse children'}
    >
      {collapsed ? '+' : '\u2212'}
    </button>
  );
}
