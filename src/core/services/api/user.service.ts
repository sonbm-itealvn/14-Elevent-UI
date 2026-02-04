import HttpService from "./http.service";
import type { 
  User, 
  UserPageResponse, 
  CreateUserRequest, 
  UpdateUserRequest,
  ToggleActiveRequest 
} from "@/domain/models/user.model";

class UserService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getUsers(params?: {
    keyword?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<UserPageResponse> {
    const response = await this.httpService.getPaginated<User>(
      "/api/admin/users",
      params
    );
    return response;
  }

  async getUserById(userId: number): Promise<User> {
    const response = await this.httpService.get<User>(
      `/api/admin/users/${userId}`
    );
    return response.data!;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.httpService.post<User>(
      "/api/admin/users",
      data
    );
    return response.data!;
  }

  async updateUser(userId: number, data: UpdateUserRequest): Promise<User> {
    const response = await this.httpService.put<User>(
      `/api/admin/users/${userId}`,
      data
    );
    return response.data!;
  }

  async toggleActive(userId: number, data: ToggleActiveRequest): Promise<User> {
    const response = await this.httpService.put<User>(
      `/api/admin/users/${userId}/active`,
      data
    );
    return response.data!;
  }

  async resetPassword(userId: number): Promise<void> {
    await this.httpService.post(`/api/admin/users/${userId}/reset-password`, {});
  }

  async deleteUser(userId: number): Promise<void> {
    await this.httpService.delete(`/api/admin/users/${userId}`);
  }
}

export default new UserService();

