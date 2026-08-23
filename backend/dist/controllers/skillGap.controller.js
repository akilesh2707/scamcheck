"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillGapController = exports.SkillGapController = void 0;
const mlClient_service_1 = require("../services/mlClient.service");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class SkillGapController {
    async analyze(req, res) {
        try {
            const { opportunityId, requiredSkills, userSkills } = req.body;
            if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
                const response = {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'requiredSkills array is required' },
                };
                res.status(400).json(response);
                return;
            }
            try {
                const result = await mlClient_service_1.mlClient.analyzeSkillGap(requiredSkills, userSkills || []);
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
                        error: { code: 'NOT_IMPLEMENTED', message: 'Skill gap analysis not yet implemented' },
                    };
                    res.status(501).json(response);
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            logger_1.logger.error('Skill gap analysis error', { error: error.message });
            throw error;
        }
    }
}
exports.SkillGapController = SkillGapController;
exports.skillGapController = new SkillGapController();
//# sourceMappingURL=skillGap.controller.js.map