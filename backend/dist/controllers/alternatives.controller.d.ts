import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class AlternativesController {
    find(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const alternativesController: AlternativesController;
//# sourceMappingURL=alternatives.controller.d.ts.map