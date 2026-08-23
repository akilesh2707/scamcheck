import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class AuthController {
    register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map