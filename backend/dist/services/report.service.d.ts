export declare const reportService: {
    getById: (id: string) => Promise<import("../types/report").AnalysisReport | null>;
    getHistory: (userId: string, page?: number, limit?: number) => Promise<{
        reports: import("../types/report").AnalysisReport[];
        total: number;
        page: number;
        totalPages: number;
    }>;
};
//# sourceMappingURL=report.service.d.ts.map