import { useState, useRef, useEffect, useCallback } from 'react';
import { useMindMapStore } from '@/store/mindMapStore';

type EditableLabelProps = {
  nodeId: string;
  label: string;
  className?: string;
};

export function EditableLabel({ nodeId, label, className = '' }: EditableLabelProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useMindMapStore((s) => s.updateNodeLabel);

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== label) {
      updateNodeLabel(nodeId, trimmed);
    } else {
      setValue(label);
    }
    setEditing(false);
  }, [value, label, nodeId, updateNodeLabel]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setValue(label);
            setEditing(false);
          }
          e.stopPropagation();
        }}
        className={`bg-transparent border-none outline-none text-center w-full ${className}`}
        style={{ caretColor: '#1DC47E' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={`cursor-text select-none ${className}`}
    >
      {label}
    </span>
  );
}
