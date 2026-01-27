import HttpService from "./http.service";
import type { 
  Product, 
  ProductPageResponse,
  ProductImage,
  ProductVariant,
  CreateProductRequest, 
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  ToggleProductStatusRequest,
  ProductSlugCheckResponse 
} from "@/domain/models/product.model";
class ProductService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getProducts(params?: {
    keyword?: string;
    categoryId?: number;
    brand?: string;
    origin?: string;
    status?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ProductPageResponse> {
    const response = await this.httpService.getPaginated<Product>(
      "/api/admin/products",
      params
    );
    return response;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.httpService.get<Product>(
      `/api/admin/products/${id}`
    );
    return response.data!;
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await this.httpService.post<Product>(
      "/api/admin/products",
      data
    );
    return response.data!;
  }

  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await this.httpService.put<Product>(
      `/api/admin/products/${id}`,
      data
    );
    return response.data!;
  }

  async updateSale(id: number, data: { isOnSale: boolean; salePercentage: number }): Promise<void> {
    await this.httpService.put(`/api/admin/products/${id}/sale`, data);
  }

  async toggleStatus(id: number, data: ToggleProductStatusRequest): Promise<void> {
    await this.httpService.put(`/api/admin/products/${id}/status`, data);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.httpService.delete(`/api/admin/products/${id}`);
  }

  async checkSlug(slug: string, excludeId?: number): Promise<ProductSlugCheckResponse> {
    const params: any = { slug };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await this.httpService.get<ProductSlugCheckResponse>(
      "/api/admin/products/check-slug",
      params
    );
    return response.data!;
  }

  // Variant methods
  async createVariant(productId: number, data: CreateVariantRequest): Promise<ProductVariant> {
    const response = await this.httpService.post<ProductVariant>(
      `/api/admin/products/${productId}/variants`,
      data
    );
    return response.data!;
  }

  async updateVariant(
    productId: number, 
    variantId: number, 
    data: UpdateVariantRequest
  ): Promise<ProductVariant> {
    const response = await this.httpService.put<ProductVariant>(
      `/api/admin/products/${productId}/variants/${variantId}`,
      data
    );
    return response.data!;
  }

  async updateVariantStock(
    productId: number, 
    variantId: number, 
    stock: number
  ): Promise<ProductVariant> {
    const response = await this.httpService.put<ProductVariant>(
      `/api/admin/products/${productId}/variants/${variantId}/stock`,
      { stock }
    );
    return response.data!;
  }

  async deleteVariant(productId: number, variantId: number): Promise<void> {
    await this.httpService.delete(
      `/api/admin/products/${productId}/variants/${variantId}`
    );
  }

  // Image methods
  async uploadImages(
    productId: number, 
    files: File[], 
    thumbnail?: boolean
  ): Promise<ProductImage[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (thumbnail !== undefined) {
      formData.append('thumbnail', thumbnail.toString());
    }
    const response = await this.httpService.upload<ProductImage[]>(
      `/api/admin/products/${productId}/images`,
      formData
    );
    return response.data!;
  }

  async updateImage(
    productId: number, 
    imageId: number, 
    data: { thumbnail?: boolean }
  ): Promise<ProductImage> {
    const response = await this.httpService.put<ProductImage>(
      `/api/admin/products/${productId}/images/${imageId}`,
      data
    );
    return response.data!;
  }

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await this.httpService.delete(
      `/api/admin/products/${productId}/images/${imageId}`
    );
  }

  // Upload single product image (returns URL string)
  async uploadProductImage(productId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.httpService.upload<string>(
      `/api/admin/products/${productId}/image`,
      formData
    );
    return response.data!;
  }

  // Upload single variant image (returns URL string)
  async uploadVariantImage(
    productId: number,
    variantId: number,
    file: File
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.httpService.upload<string>(
      `/api/admin/products/${productId}/variants/${variantId}/image`,
      formData
    );
    return response.data!;
  }
}

export default new ProductService();

