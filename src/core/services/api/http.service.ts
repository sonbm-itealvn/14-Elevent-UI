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

    public async upload<T>(url: string, payload: FormData) :Promise<T> {
        try {
            const response = await this.axiosInstance.post<T>(url, payload, { signal: this.controller.signal });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    public async put<T>(url: string, payload: Record<string,any> | null) :Promise<BaseResponse<T>> {
        try {
            const response = await this.axiosInstance.put<BaseResponse<T>>(url, payload, { signal: this.controller.signal });
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

    public async delete<T>(url: string) :Promise<T> {
        try {
            const response = await this.axiosInstance.delete<T>(url, { signal: this.controller.signal });
            return response.data as T;
        } catch (error) {
            throw error;
        }
    }

    public async getPaginated<T>(url: string, params?: Record<string,any> | null) :Promise<BasePaginationResponse<T>> {
        try {
            const response = await this.axiosInstance.get<BasePaginationResponse<T>>(url, { params, signal: this.controller.signal });
            return response.data as BasePaginationResponse<T>;
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