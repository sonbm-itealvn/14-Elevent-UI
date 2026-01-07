type BaseResponse<T> = {
    success: boolean;
    message?: string;
    errorCode?: string;
    data?: T;
    timestamp?: string;
}

export type { BaseResponse };