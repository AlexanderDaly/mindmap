import { ReactFlowProvider } from '@xyflow/react';
import { MindMapCanvas } from './components/MindMapCanvas';

export default function App() {
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}
