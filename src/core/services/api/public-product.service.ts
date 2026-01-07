import HttpService from "./http.service";
import type { Product } from "@/domain/models/product.model";
import type { BasePaginationResponse } from "@/core/models/base-pagination-response.model";

export interface PublicProduct {
  id: number;
  name: string;
  slug: string;
  thumbnail?: string;
  minPrice?: number;
  brand?: string;
  origin?: string;
}

export interface PublicProductPageResponse {
  content: PublicProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  origin?: string;
  weight?: number;
  weightUnit?: string;
  expiryInfo?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  images?: Array<{
    id: number;
    imageUrl: string;
    thumbnail: boolean;
  }>;
  variants?: Array<{
    id: number;
    sku: string;
    price: number;
    stock: number;
    attributes?: Record<string, any>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

class PublicProductService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getProducts(params?: {
    categorySlug?: string;
    keyword?: string;
    brand?: string;
    origin?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: number;
    size?: number;
  }): Promise<PublicProductPageResponse> {
    const response = await this.httpService.getPaginated<PublicProduct>(
      "/api/products",
      params
    );
    return response;
  }

  async getProductsByCategory(
    categorySlug: string,
    params?: {
      keyword?: string;
      brand?: string;
      origin?: string;
      minPrice?: string;
      maxPrice?: string;
      sort?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PublicProductPageResponse> {
    const response = await this.httpService.getPaginated<PublicProduct>(
      `/api/categories/${categorySlug}/products`,
      params
    );
    return response;
  }

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response = await this.httpService.get<ProductDetail>(
      `/api/products/${slug}`
    );
    return response.data!;
  }

  async getTopSelling(limit: number = 8): Promise<PublicProduct[]> {
    const response = await this.httpService.get<PublicProduct[]>(
      "/api/products/top-selling",
      { limit }
    );
    return response.data || [];
  }

  async searchProducts(query: string): Promise<PublicProduct[]> {
    const response = await this.httpService.get<PublicProduct[]>(
      "/api/products/search",
      { q: query }
    );
    return response.data || [];
  }

  async getRelatedProducts(productId: number): Promise<PublicProduct[]> {
    const response = await this.httpService.get<PublicProduct[]>(
      `/api/products/${productId}/related`
    );
    return response.data || [];
  }
}

export default new PublicProductService();

