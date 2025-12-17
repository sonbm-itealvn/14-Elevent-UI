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
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
        const accessToken = JwtService.getAccessToken();
        const refreshToken = JwtService.getRefreshToken();
        if (!refreshToken) {
          JwtService.clearAllTokens();
          window.location.href = "/login"; 
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "x-refresh-token": refreshToken,
            },
          }
        );

        if (response.status === 200) {
          const { accessToken, refreshToken } = response.data;
          JwtService.setAccessToken(accessToken);
          JwtService.setRefreshToken(refreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
