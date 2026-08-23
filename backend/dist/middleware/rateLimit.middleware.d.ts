import { Request, Response, NextFunction } from 'express';
export declare const initRateLimiter: () => Promise<void>;
export declare const rateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimit.middleware.d.ts.map