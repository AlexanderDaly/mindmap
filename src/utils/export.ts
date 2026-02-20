import type { MindMapNode, MindMapEdge } from '@/types';

export function exportToJSON(name: string, nodes: MindMapNode[], edges: MindMapEdge[]): void {
  const data = JSON.stringify({ name, nodes, edges }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<{ name: string; nodes: MindMapNode[]; edges: MindMapEdge[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve({ name: data.name ?? 'Imported Map', nodes: data.nodes ?? [], edges: data.edges ?? [] });
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
