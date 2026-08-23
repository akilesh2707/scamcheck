"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suitabilityController = exports.SuitabilityController = void 0;
const mlClient_service_1 = require("../services/mlClient.service");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class SuitabilityController {
    async analyze(req, res, next) {
        try {
            const { opportunityId, opportunity, userProfile } = req.body;
            if (!opportunityId && !opportunity) {
                const response = {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'Either opportunityId or opportunity must be provided' },
                };
                res.status(400).json(response);
                return;
            }
            const opp = opportunity;
            if (opportunityId) {
                const response = {
                    success: false,
                    error: { code: 'NOT_IMPLEMENTED', message: 'Fetching opportunity by ID not yet implemented' },
                };
                res.status(501).json(response);
                return;
            }
            try {
                const result = await mlClient_service_1.mlClient.analyzeSuitability(opp, userProfile);
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
                        error: { code: 'NOT_IMPLEMENTED', message: 'Suitability analysis not yet implemented' },
                    };
                    res.status(501).json(response);
                    return;
                }
                next(error);
            }
        }
        catch (error) {
            logger_1.logger.error('Suitability analysis error', { error: error.message });
            next(error);
        }
    }
}
exports.SuitabilityController = SuitabilityController;
exports.suitabilityController = new SuitabilityController();
//# sourceMappingURL=suitability.controller.js.map