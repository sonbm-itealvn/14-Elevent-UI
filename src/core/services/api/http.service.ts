import axiosInstance from "@/core/interceptors/axios.instance";
import type { BaseResponse } from "@/core/models/base-response.model";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { BasePaginationResponse } from "@/core/models/base-pagination-response.model";

class HttpService {

    private readonly axiosInstance: AxiosInstance;
    private readonly controller: AbortController;

    constructor() {
        this.axiosInstance = axiosInstance;
        this.controller = new AbortController();
    }
    public async get<T>(url: string, params?: Record<string,any> | null) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.get<BaseResponse<T>>(url, { params, signal: this.controller.signal });
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async post<T>(url: string, payload: Record<string,any> | null) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.post<BaseResponse<T>>(url, payload, { signal: this.controller.signal });
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async upload<T>(url: string, payload: FormData) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.post<BaseResponse<T>>(url, payload, { 
                signal: this.controller.signal,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async put<T>(url: string, payload: Record<string,any> | FormData | null) :Promise<BaseResponse<T>> {
        try {
            const config: AxiosRequestConfig = { signal: this.controller.signal };
            
            // Nếu payload là FormData, thêm header multipart/form-data
            if (payload instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data'
                };
            }
            
            const response = await this.axiosInstance.put<BaseResponse<T>>(url, payload, config);
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async patch<T>(url: string, payload: Record<string,any> | null) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.patch<BaseResponse<T>>(url, payload, { signal: this.controller.signal });
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async delete<T>(url: string) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.delete<BaseResponse<T>>(url, { signal: this.controller.signal });
            return response.data as BaseResponse<T>;
        } catch (error) {
            throw error;
        }
    }

    public async getPaginated<T>(url: string, params?: Record<string,any> | null) :Promise<BasePaginationResponse<T>> {
        try {
            const response = await this.axiosInstance.get<BaseResponse<BasePaginationResponse<T>>>(url, { params, signal: this.controller.signal });
            // API trả về {success: true, data: {content: [], page, size, ...}}
            return response.data.data!;
        } catch (error) {
            throw error;
        }
    }

    public async getThirdParty<T>(url: string, params?: Record<string,any> | null, options?: AxiosRequestConfig) :Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url, { params, signal: this.controller.signal, ...options });
            return response.data as T;
        } catch (error) {
            throw error;
        }
    }

}

export default HttpService;