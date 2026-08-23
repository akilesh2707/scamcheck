import { AnalysisReport } from '../types/report';
export declare class AnalysisService {
    analyzeText(text: string, userId?: string): Promise<AnalysisReport>;
    private basicExtraction;
    private extractOrgName;
    private extractRole;
    private extractFees;
    private extractStipend;
    private localRiskAnalysis;
    private localPaymentVerification;
    getReportById(reportId: string): Promise<AnalysisReport | null>;
    getHistory(userId: string, page?: number, limit?: number): Promise<{
        reports: AnalysisReport[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
export declare const analysisService: AnalysisService;
//# sourceMappingURL=analysis.service.d.ts.map