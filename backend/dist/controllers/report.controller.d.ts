import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class ReportController {
    getReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    getHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map