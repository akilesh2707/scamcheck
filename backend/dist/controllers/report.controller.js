"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const analysis_service_1 = require("../services/analysis.service");
class ReportController {
    async getReport(req, res, next) {
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
            next(error);
        }
    }
    async getHistory(req, res, next) {
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
            next(error);
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map