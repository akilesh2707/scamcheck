"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeController = exports.AnalyzeController = void 0;
const analysis_service_1 = require("../services/analysis.service");
const logger_1 = require("../utils/logger");
class AnalyzeController {
    async analyze(req, res) {
        try {
            const { inputType, text, url, userProfile } = req.body;
            const userId = req.user?.id;
            let result;
            if (inputType === 'text') {
                if (!text || text.trim().length === 0) {
                    const response = {
                        success: false,
                        error: { code: 'INVALID_INPUT', message: 'Text is required for text input type' },
                    };
                    res.status(400).json(response);
                    return;
                }
                result = await analysis_service_1.analysisService.analyzeText(text, userId);
            }
            else {
                const response = {
                    success: false,
                    error: { code: 'NOT_IMPLEMENTED', message: `${inputType} input type is not yet implemented` },
                };
                res.status(501).json(response);
                return;
            }
            const response = {
                success: true,
                data: result,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Analysis error', { error: error.message });
            throw error;
        }
    }
    async getReport(req, res) {
        try {
            const { id } = req.params;
            const report = await analysis_service_1.analysisService.getReportById(id);
            if (!report) {
                const response = {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Report not found' },
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: report,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Get report error', { error: error.message });
            throw error;
        }
    }
    async getHistory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                };
                res.status(401).json(response);
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await analysis_service_1.analysisService.getHistory(userId, page, limit);
            const response = {
                success: true,
                data: result,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Get history error', { error: error.message });
            throw error;
        }
    }
}
exports.AnalyzeController = AnalyzeController;
exports.analyzeController = new AnalyzeController();
//# sourceMappingURL=analyze.controller.js.map