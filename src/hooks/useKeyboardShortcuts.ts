import { useEffect } from 'react';
import { useMindMapStore } from '@/store/mindMapStore';
import { exportToJSON } from '@/utils/export';

export function useKeyboardShortcuts() {
  const store = useMindMapStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const selectedNode = store.nodes.find((n) => n.selected);

      switch (e.key) {
        case 'Enter':
          if (selectedNode) {
            e.preventDefault();
            store.addChild(selectedNode.id);
          }
          break;

        case 'Tab':
          if (selectedNode) {
            e.preventDefault();
            store.addSibling(selectedNode.id);
          }
          break;

        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          store.deleteSelected();
          break;

        case 'F2':
          // F2 to start editing — handled by EditableLabel via custom event
          if (selectedNode) {
            e.preventDefault();
            const nodeEl = document.querySelector(`[data-id="${selectedNode.id}"]`);
            const label = nodeEl?.querySelector('span');
            if (label) {
              const dblClick = new MouseEvent('dblclick', { bubbles: true });
              label.dispatchEvent(dblClick);
            }
          }
          break;

        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            store.save();
          }
          break;

        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            exportToJSON(store.docName, store.nodes, store.edges);
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
}
