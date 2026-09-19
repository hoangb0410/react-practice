export interface IAppResponse<T> {
  data?: T;
  success: boolean;
  code: number;
  message?: string;
}

export interface IPagingItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export interface ITableSearchParams {
  page?: number | null;
  limit?: number | null;
  search?: string | null;
  sortBy?: string | null;
  sortField?: string | null;
}

export interface IOption {
  label: string;
  value: number | string;
}
