
import { useState, useEffect } from 'react';

export type InboxFilter = 'active' | 'archived' | 'all';

export const useInboxFilters = () => {
  const [currentFilter, setCurrentFilter] = useState<InboxFilter>('active');

  // Persist filter preference in localStorage
  useEffect(() => {
    const savedFilter = localStorage.getItem('inbox-filter') as InboxFilter;
    if (savedFilter && ['active', 'archived', 'all'].includes(savedFilter)) {
      setCurrentFilter(savedFilter);
    }
  }, []);

  const setFilter = (filter: InboxFilter) => {
    setCurrentFilter(filter);
    localStorage.setItem('inbox-filter', filter);
  };

  return {
    currentFilter,
    setFilter,
  };
};
