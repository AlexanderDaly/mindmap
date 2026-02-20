import { useEffect, useRef } from 'react';
import { useMindMapStore } from '@/store/mindMapStore';

export function usePersistence() {
  const save = useMindMapStore((s) => s.save);
  const nodes = useMindMapStore((s) => s.nodes);
  const edges = useMindMapStore((s) => s.edges);
  const docName = useMindMapStore((s) => s.docName);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-save with debounce
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save();
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [nodes, edges, docName, save]);
}
