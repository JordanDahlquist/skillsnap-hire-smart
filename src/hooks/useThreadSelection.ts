
import { useState, useCallback } from 'react';

export const useThreadSelection = () => {
  const [selectedThreadIds, setSelectedThreadIds] = useState<Set<string>>(new Set());

  const toggleThread = useCallback((threadId: string) => {
    setSelectedThreadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((threadIds: string[]) => {
    setSelectedThreadIds(new Set(threadIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedThreadIds(new Set());
  }, []);

  const isSelected = useCallback((threadId: string) => {
    return selectedThreadIds.has(threadId);
  }, [selectedThreadIds]);

  return {
    selectedThreadIds: Array.from(selectedThreadIds),
    toggleThread,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedThreadIds.size > 0,
    selectionCount: selectedThreadIds.size,
  };
};
