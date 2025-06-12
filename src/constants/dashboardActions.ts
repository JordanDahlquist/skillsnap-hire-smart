
export const DASHBOARD_ACTION_CONSTANTS = {
  AI_REFRESH: {
    BATCH_SIZE: 3,
    BATCH_DELAY: 1000,
    TIMEOUT_RANGE: '10-30 seconds'
  },
  MESSAGES: {
    AI_REFRESH_START: 'Refreshing AI rankings',
    AI_REFRESH_SUCCESS: 'AI rankings refreshed',
    AI_REFRESH_FAILED: 'Refresh failed',
    STATUS_UPDATED: 'Status updated',
    UPDATE_FAILED: 'Update failed',
    LINK_COPIED: 'Link copied!',
    NO_DATA_EXPORT: 'No data to export',
    EXPORT_COMPLETED: 'Export completed',
    EXPORT_FAILED: 'Export failed'
  },
  ERROR_CODES: {
    NOT_FOUND: 'PGRST116',
    PERMISSION_DENIED: '42501',
    RLS_VIOLATION: 'row-level security',
    JWT_ERROR: 'JWT'
  }
} as const;
