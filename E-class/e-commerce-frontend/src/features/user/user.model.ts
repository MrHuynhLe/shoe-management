export interface User {
id: number;
  username: string;
  email: string;
  role: string;
  roleId?: number;
  fullName: string;
  phone?: string;
  address?: string;
  birthday?: string;
  salary?: number;
  isActive: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}