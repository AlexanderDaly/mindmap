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

  return (
    <div
      className="relative rounded-2xl px-5 py-3 min-w-[140px] max-w-[260px] text-center transition-all duration-200"
      style={{
        background: isDropTarget ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1.5px solid ${isDropTarget ? 'rgba(168, 85, 247, 0.8)' : selected ? colors.border : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: isDropTarget
          ? '0 0 24px rgba(168, 85, 247, 0.5), 0 0 48px rgba(168, 85, 247, 0.3)'
          : selected
            ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
            : `0 0 12px ${colors.glow}`,
        color: colors.text,
        transform: isDropTarget ? 'scale(1.05)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
