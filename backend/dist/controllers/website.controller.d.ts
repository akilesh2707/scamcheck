import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class WebsiteController {
    analyze(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const websiteController: WebsiteController;
//# sourceMappingURL=website.controller.d.ts.map