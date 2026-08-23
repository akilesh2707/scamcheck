import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    code: string;
    statusCode: number;
    details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
}
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=error.middleware.d.ts.map