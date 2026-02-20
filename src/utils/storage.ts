import type { MindMapDocument } from '@/types';
import { STORAGE_KEY, ACTIVE_DOC_KEY } from './constants';

export function loadDocuments(): MindMapDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDocuments(docs: MindMapDocument[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function saveDocument(doc: MindMapDocument): void {
  const docs = loadDocuments();
  const idx = docs.findIndex((d) => d.id === doc.id);
  if (idx >= 0) {
    docs[idx] = doc;
  } else {
    docs.push(doc);
  }
  saveDocuments(docs);
}

export function deleteDocument(id: string): void {
  const docs = loadDocuments().filter((d) => d.id !== id);
  saveDocuments(docs);
}

export function getActiveDocId(): string | null {
  return localStorage.getItem(ACTIVE_DOC_KEY);
}

export function setActiveDocId(id: string): void {
  localStorage.setItem(ACTIVE_DOC_KEY, id);
}
