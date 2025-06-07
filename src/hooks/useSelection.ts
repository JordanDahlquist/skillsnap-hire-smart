
import { useState, useCallback } from "react";

export const useSelection = <T extends string | number>(items: T[] = []) => {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const handleSelection = useCallback((itemId: T, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean, availableItems: T[]) => {
    if (checked) {
      setSelectedItems(availableItems);
    } else {
      setSelectedItems([]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((itemId: T) => {
    return selectedItems.includes(itemId);
  }, [selectedItems]);

  const isAllSelected = useCallback((availableItems: T[]) => {
    return availableItems.length > 0 && availableItems.every(item => selectedItems.includes(item));
  }, [selectedItems]);

  return {
    selectedItems,
    handleSelection,
    handleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectionCount: selectedItems.length
  };
};
