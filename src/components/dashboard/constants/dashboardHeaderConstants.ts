
export const DASHBOARD_HEADER_CONSTANTS = {
  STICKY_TOP_OFFSET: 'top-16',
  Z_INDEX: 'z-40',
  MAX_WIDTH: 'max-w-7xl',
  PADDING: {
    HORIZONTAL: 'px-4 sm:px-6 lg:px-8',
    VERTICAL: 'py-3'
  },
  LOADING_OVERLAY: {
    BACKDROP: 'fixed inset-0 bg-black bg-opacity-50 z-50',
    CONTENT: 'bg-card rounded-lg p-6'
  }
} as const;

export const DROPDOWN_ACTIONS = {
  EDIT: 'edit',
  EXPORT: 'export',
  ARCHIVE: 'archive',
  UNARCHIVE: 'unarchive'
} as const;
