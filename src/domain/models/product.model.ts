export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  origin?: string;
  weight?: number;
  weightUnit?: string;
  expiryInfo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  categoryName?: string;
  minPrice?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  thumbnail: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name?: string;
  price: number;
  stock: number;
  attributes?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPageResponse {
  content: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateProductRequest {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  origin?: string;
  weight?: number;
  weightUnit?: string;
  expiryInfo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProductRequest {
  categoryId?: number;
  name?: string;
  slug?: string;
  description?: string;
  brand?: string;
  origin?: string;
  weight?: number;
  weightUnit?: string;
  expiryInfo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateVariantRequest {
  sku: string;
  name?: string;
  price: number;
  stock: number;
  attributes?: Record<string, any>;
}

export interface UpdateVariantRequest {
  sku?: string;
  name?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, any>;
}

export interface UpdateVariantStockRequest {
  stock: number;
}

export interface ToggleProductStatusRequest {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductSlugCheckResponse {
  slug: string;
  available: boolean;
}

