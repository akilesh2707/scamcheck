import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class AlternativesController {
    find(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const alternativesController: AlternativesController;
//# sourceMappingURL=alternatives.controller.d.ts.map