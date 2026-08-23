import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class SuitabilityController {
    analyze(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const suitabilityController: SuitabilityController;
//# sourceMappingURL=suitability.controller.d.ts.map