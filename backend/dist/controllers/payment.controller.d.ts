import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class PaymentController {
    verify(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const paymentController: PaymentController;
//# sourceMappingURL=payment.controller.d.ts.map