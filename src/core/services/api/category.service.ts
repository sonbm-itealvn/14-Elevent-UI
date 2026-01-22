import HttpService from "./http.service";
import type { 
  Category, 
  CategoryTreeResponse,
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  SlugCheckResponse 
} from "@/domain/models/category.model";
class CategoryService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.httpService.get<Category[]>(
      "/api/categories"
    );
    return response.data || [];
  }

  async getCategoryTree(): Promise<CategoryTreeResponse[]> {
    const response = await this.httpService.get<CategoryTreeResponse[]>(
      "/api/categories/tree"
    );
    return response.data || [];
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await this.httpService.get<Category>(
      `/api/admin/categories/${id}`
    );
    return response.data!;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await this.httpService.post<Category>(
      "/api/admin/categories",
      data
    );
    return response.data!;
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
    const response = await this.httpService.put<Category>(
      `/api/admin/categories/${id}`,
      data
    );
    return response.data!;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.httpService.delete(`/api/admin/categories/${id}`);
  }

  async checkSlug(slug: string, excludeId?: number): Promise<SlugCheckResponse> {
    const params: any = { slug };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await this.httpService.get<SlugCheckResponse>(
      "/api/admin/categories/check-slug",
      params
    );
    return response.data!;
  }
}

export default new CategoryService();

