export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parentName?: string | null;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeResponse {
  id: number;
  name: string;
  slug: string;
  children?: CategoryTreeResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: number | null;
}

export interface SlugCheckResponse {
  slug: string;
  available: boolean;
}

