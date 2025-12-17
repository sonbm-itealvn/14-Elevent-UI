type BasePaginationResponse<T> = {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

export type { BasePaginationResponse };