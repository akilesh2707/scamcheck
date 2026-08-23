import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class AnalyzeController {
    analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const analyzeController: AnalyzeController;
//# sourceMappingURL=analyze.controller.d.ts.map