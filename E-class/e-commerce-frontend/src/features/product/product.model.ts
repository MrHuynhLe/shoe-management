export interface ProductList {
  id: number;
  code: string;
  name: string;
  brandName: string;
  categoryName: string;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  imageUrl: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
