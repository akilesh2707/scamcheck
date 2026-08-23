import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class CompanyController {
    verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const companyController: CompanyController;
//# sourceMappingURL=company.controller.d.ts.map