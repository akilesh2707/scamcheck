"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const mlClient_service_1 = require("../services/mlClient.service");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class PaymentController {
    async verify(req, res) {
        try {
            const { opportunityId, opportunity, claimedAmount, claimedPurpose } = req.body;
            if (!opportunityId && !opportunity) {
                const response = {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'Either opportunityId or opportunity must be provided' },
                };
                res.status(400).json(response);
                return;
            }
            let opp = opportunity;
            if (opportunityId) {
                const response = {
                    success: false,
                    error: { code: 'NOT_IMPLEMENTED', message: 'Fetching opportunity by ID not yet implemented' },
                };
                res.status(501).json(response);
                return;
            }
            try {
                const result = await mlClient_service_1.mlClient.verifyPayment(opp);
                const response = {
                    success: true,
                    data: result,
                };
                res.json(response);
            }
            catch (error) {
                if (error instanceof errors_1.NotImplementedError) {
                    const response = {
                        success: false,
                        error: { code: 'NOT_IMPLEMENTED', message: 'Payment verification not yet implemented' },
                    };
                    res.status(501).json(response);
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            logger_1.logger.error('Payment verification error', { error: error.message });
            throw error;
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=payment.controller.js.map