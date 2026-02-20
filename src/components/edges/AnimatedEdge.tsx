import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const gradientId = `gradient-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1DC47E" />
          <stop offset="60%" stopColor="#F0EBE0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
        </linearGradient>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: `url(#${gradientId})`,
          strokeWidth: selected ? 2.5 : 1.5,
          filter: selected ? 'drop-shadow(0 0 4px rgba(29, 196, 126, 0.4))' : undefined,
        }}
      />
      {/* Traveling dot animation */}
      <circle r="2.5" fill="#1DC47E" filter="drop-shadow(0 0 3px rgba(29, 196, 126, 0.6))">
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
