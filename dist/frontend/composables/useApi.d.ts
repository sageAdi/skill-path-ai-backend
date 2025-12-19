export declare const useApi: () => {
    get: <T>(endpoint: string) => Promise<T>;
    post: <T>(endpoint: string, body?: unknown) => Promise<T>;
    patch: <T>(endpoint: string, body?: unknown) => Promise<T>;
    delete: <T>(endpoint: string) => Promise<T>;
    setToken: (token: string | null) => void;
    getToken: () => string | null;
};
