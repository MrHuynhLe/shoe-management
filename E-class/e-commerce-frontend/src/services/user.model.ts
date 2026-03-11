export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  birthday: string;
  role: string;
  isActive: boolean;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  roleId: number;
}

export interface UserUpdateRequest {
  fullName: string;
  phone: string;
  roleId: number;
  isActive: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProfileUpdateRequest {
  fullName: string;
  phone: string;
  address?: string;
  birthday?: string | null;
}