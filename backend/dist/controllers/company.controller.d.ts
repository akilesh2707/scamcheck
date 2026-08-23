import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class CompanyController {
    verify(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const companyController: CompanyController;
//# sourceMappingURL=company.controller.d.ts.map