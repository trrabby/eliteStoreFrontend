export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  meta: PaginationMeta;
  data: T[];
}
