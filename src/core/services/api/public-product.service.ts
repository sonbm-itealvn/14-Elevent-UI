import HttpService from "./http.service";

export interface PublicProduct {
  id: number;
  name: string;
  slug: string;
  thumbnail?: string;
  minPrice?: number;
  isOnSale?: boolean;
  salePercentage?: number;
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
  // Thông tin sale (giống PublicProduct, dùng cho hiển thị giá)
  isOnSale?: boolean;
  salePercentage?: number;
  weight?: number;
  weightUnit?: string;
  expiryInfo?: string;
  imageUrl?: string;
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
    imageUrl?: string;
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

