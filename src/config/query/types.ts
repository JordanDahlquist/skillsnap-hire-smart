
export interface QueryError extends Error {
  status?: number;
  code?: string;
}
