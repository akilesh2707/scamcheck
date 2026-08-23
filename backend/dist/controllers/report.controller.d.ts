import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class ReportController {
    getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map