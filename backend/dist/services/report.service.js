"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const analysis_service_1 = require("./analysis.service");
exports.reportService = {
    getById: (id) => analysis_service_1.analysisService.getReportById(id),
    getHistory: (userId, page, limit) => analysis_service_1.analysisService.getHistory(userId, page, limit),
};
//# sourceMappingURL=report.service.js.map