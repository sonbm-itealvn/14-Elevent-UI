import axios, { type AxiosError, type AxiosInstance } from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT,
  API_HEADERS,
} from "@/shared/constants/api.constant";
import JwtService from "../services/storages/jwt.service";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: API_HEADERS,
  timeout: API_TIMEOUT,
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    const accessToken = JwtService.getAccessToken();

    // Tìm header X-Cart-Token theo cách không phân biệt hoa thường
    const headers = (config.headers || {}) as Record<string, any>;
    const headerKeys: string[] =
      typeof (headers as any).keys === "function"
        ? Array.from((headers as any).keys() as string[])
        : Object.keys(headers);

    // Flag cho phép gửi Authorization cùng X-Cart-Token (dùng cho merge)
    const allowAuthWithCartToken = headerKeys.some(
      (key) => key.toLowerCase() === "x-allow-auth-with-cart-token"
    );

    // Nếu có flag, loại bỏ flag khỏi headers trước khi gửi
    if (allowAuthWithCartToken) {
      if (typeof headers.delete === "function") {
        headers.delete("X-Allow-Auth-With-Cart-Token");
      } else {
        delete (headers as any)["X-Allow-Auth-With-Cart-Token"];
        delete (headers as any)["x-allow-auth-with-cart-token"];
      }
    }

    const hasCartToken = headerKeys.some(
      (key) => key.toLowerCase() === "x-cart-token"
    );

    // Guest cart: không gửi Authorization nếu có X-Cart-Token
    if (hasCartToken && !allowAuthWithCartToken) {
      if (typeof (headers as any).delete === "function") {
        (headers as any).delete("Authorization");
      } else {
        delete (headers as any).Authorization;
        delete (headers as any).authorization;
      }
      return config;
    }

    // User cart: thêm Authorization nếu có accessToken
    if (accessToken) {
      if (typeof (headers as any).set === "function") {
        (headers as any).set("Authorization", `Bearer ${accessToken}`);
      } else {
        (headers as any).Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config: any }) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = JwtService.getRefreshToken();
        if (!refreshToken) {
          JwtService.clearAllTokens();
          window.location.href = "/auth/login"; 
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          const authData = response.data.data;
          JwtService.setAccessToken(authData.accessToken);
          JwtService.setRefreshToken(authData.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
          return axiosInstance(originalRequest);
        }

        JwtService.clearAllTokens();
        return Promise.reject(error);
      } catch (e) {
        JwtService.clearAllTokens();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
