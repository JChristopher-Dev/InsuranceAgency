export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T | null;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data:    T[];
  total:   number;
}