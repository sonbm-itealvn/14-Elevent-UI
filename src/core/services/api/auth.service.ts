import HttpService from "./http.service";
import JwtService from "../storages/jwt.service";
import type { User } from "@/domain/models/user.model";

export interface LoginRequest {
  email: string;
  password: string;
  cartToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  cartToken?: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  cart?: any;
}

export interface OAuthLoginUrl {
  provider: string;
  authorizationUrl: string;
}

class AuthService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.httpService.post<AuthResponse>(
      "/api/auth/login",
      data
    );
    const authData = response.data!;
    
    // Save tokens
    JwtService.setAccessToken(authData.accessToken);
    JwtService.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.httpService.post<AuthResponse>(
      "/api/auth/register",
      data
    );
    const authData = response.data!;
    
    // Save tokens
    JwtService.setAccessToken(authData.accessToken);
    JwtService.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  async logout(): Promise<void> {
    const refreshToken = JwtService.getRefreshToken();
    if (refreshToken) {
      try {
        await this.httpService.post("/api/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    JwtService.clearAllTokens();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.httpService.get<User>("/api/users/me");
    return response.data!;
  }

  /**
   * Lấy danh sách OAuth login URLs (Google, Facebook, ...)
   */
  async getOAuthLoginUrls(): Promise<OAuthLoginUrl[]> {
    const response = await this.httpService.get<OAuthLoginUrl[]>(
      "/api/oauth2/login-urls"
    );
    return response.data || [];
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = JwtService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await this.httpService.post<AuthResponse>(
      "/api/auth/refresh",
      { refreshToken }
    );
    const authData = response.data!;
    
    // Update tokens
    JwtService.setAccessToken(authData.accessToken);
    JwtService.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  isAuthenticated(): boolean {
    return !!JwtService.getAccessToken();
  }
}

export default new AuthService();

