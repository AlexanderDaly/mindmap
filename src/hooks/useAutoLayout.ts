import { useCallback } from 'react';
import { useMindMapStore } from '@/store/mindMapStore';
import type { LayoutDirection } from '@/types';

export function useAutoLayout() {
  const autoLayout = useMindMapStore((s) => s.autoLayout);
  const layoutDirection = useMindMapStore((s) => s.layoutDirection);
  const setLayoutDirection = useMindMapStore((s) => s.setLayoutDirection);

  const layout = useCallback(
    (direction?: LayoutDirection) => {
      autoLayout(direction);
    },
    [autoLayout],
  );

  const toggleDirection = useCallback(() => {
    const newDir = layoutDirection === 'TB' ? 'LR' : 'TB';
    setLayoutDirection(newDir);
    autoLayout(newDir);
  }, [layoutDirection, setLayoutDirection, autoLayout]);

  return { layout, toggleDirection, layoutDirection };
}
