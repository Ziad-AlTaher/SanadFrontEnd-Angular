/**
 * Standard Result wrapper from the backend.
 * All backend API responses wrap their data in this format.
 */
export interface Result<T> {
    status: boolean;
    statusCode: number;
    message: string;
    data: T;
}

/**
 * Generic paginated API response from the backend.
 * Often contained inside a Result<T>, for example: Result<PaginatedData<User>>
 */
export interface PaginatedData<T> {
    items: T[];
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    nextPage: boolean;
}
