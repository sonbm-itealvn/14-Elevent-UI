import HttpService from "./http.service";
import type { User } from "@/domain/models/user.model";

class UserProfileService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.httpService.get<User>("/api/users/me");
    return response.data!;
  }

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
  }): Promise<User> {
    const response = await this.httpService.put<User>("/api/users/me", data);
    return response.data!;
  }

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.httpService.upload<User>(
      "/api/users/me/avatar",
      formData
    );
    return response.data!;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.httpService.put("/api/users/me/password", data);
  }
}

export default new UserProfileService();

