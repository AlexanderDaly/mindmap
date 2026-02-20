import type { ReactNode } from 'react';
import type { MindMapNodeType } from '@/types';
import { NODE_COLORS } from '@/utils/constants';

type NodeWrapperProps = {
  type: MindMapNodeType;
  selected: boolean;
  isDropTarget?: boolean;
  children: ReactNode;
};

export function NodeWrapper({ type, selected, isDropTarget, children }: NodeWrapperProps) {
  const colors = NODE_COLORS[type];

  const bg = isDropTarget
    ? 'rgba(29, 196, 126, 0.12)'
    : type === 'root'
      ? 'rgba(29, 196, 126, 0.08)'
      : 'rgba(255, 255, 255, 0.04)';

  const borderColor = isDropTarget
    ? 'rgba(29, 196, 126, 0.8)'
    : selected
      ? colors.border
      : 'rgba(255, 255, 255, 0.08)';

  const shadow = isDropTarget
    ? '0 0 24px rgba(29, 196, 126, 0.4), 0 0 48px rgba(29, 196, 126, 0.2)'
    : selected
      ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
      : `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px ${colors.glow}`;

  return (
    <div
      className="relative rounded-2xl px-5 py-3 min-w-[140px] max-w-[260px] text-center transition-all duration-200"
      style={{
        background: bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        color: colors.text,
        transform: isDropTarget ? 'scale(1.05)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
