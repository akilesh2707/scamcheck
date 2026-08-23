import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class WebsiteController {
    analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const websiteController: WebsiteController;
//# sourceMappingURL=website.controller.d.ts.map