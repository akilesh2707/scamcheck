export declare class AppError extends Error {
    code: string;
    statusCode: number;
    details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: unknown);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, retryAfter?: number);
}
export declare class ExternalServiceError extends AppError {
    constructor(service: string, message: string, details?: unknown);
}
export declare class NotImplementedError extends AppError {
    constructor(feature: string);
}
export declare const isAppError: (error: unknown) => error is AppError;
//# sourceMappingURL=errors.d.ts.map