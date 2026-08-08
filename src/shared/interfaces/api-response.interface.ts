/**
 * Universal API Response Wrapper
 * Ensures consistent serialization of JSON responses from NestJS controllers to Next.js clients.
 */
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | Record<string, string[]>;
  timestamp: string;
}

/**
 * Paginated Meta Record
 */
export interface IPaginatedMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated API Response Wrapper
 */
export interface IPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: IPaginatedMeta;
  timestamp: string;
}
