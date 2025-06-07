
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  INVALID_FILE_TYPE: 'File type not supported'
} as const;

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  EMAIL_SENT: 'Email sent successfully',
  EXPORT_COMPLETED: 'Export completed successfully'
} as const;

export const LOADING_MESSAGES = {
  SAVING: 'Saving changes...',
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  UPLOADING: 'Uploading file...',
  GENERATING: 'Generating content...'
} as const;
