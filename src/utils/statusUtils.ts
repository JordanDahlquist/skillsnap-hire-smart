
export const JOB_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  DRAFT: 'draft',
  ARCHIVED: 'archived'
} as const;

export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const getJobStatusColor = (status: string): string => {
  switch (status) {
    case JOB_STATUSES.ACTIVE:
      return "bg-blue-100 text-blue-800";
    case JOB_STATUSES.PAUSED:
      return "bg-yellow-100 text-yellow-800";
    case JOB_STATUSES.CLOSED:
    case JOB_STATUSES.ARCHIVED:
      return "bg-red-100 text-red-800";
    case JOB_STATUSES.DRAFT:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getApplicationStatusColor = (status: string): string => {
  switch (status) {
    case APPLICATION_STATUSES.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case APPLICATION_STATUSES.REVIEWED:
      return "bg-blue-100 text-blue-800";
    case APPLICATION_STATUSES.APPROVED:
      return "bg-green-100 text-green-800";
    case APPLICATION_STATUSES.REJECTED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPerformanceIndicator = (applicationCount: number) => {
  if (applicationCount === 0) return { text: "New", color: "bg-gray-100 text-gray-800" };
  if (applicationCount >= 20) return { text: "High Interest", color: "bg-green-100 text-green-800" };
  if (applicationCount >= 10) return { text: "Good Traction", color: "bg-blue-100 text-blue-800" };
  return { text: "Building Interest", color: "bg-yellow-100 text-yellow-800" };
};
