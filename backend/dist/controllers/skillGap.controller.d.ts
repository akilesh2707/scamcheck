import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class SkillGapController {
    analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const skillGapController: SkillGapController;
//# sourceMappingURL=skillGap.controller.d.ts.map