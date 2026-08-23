import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class AuthController {
    register(req: AuthenticatedRequest, res: Response): Promise<void>;
    login(req: AuthenticatedRequest, res: Response): Promise<void>;
    me(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUserProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map