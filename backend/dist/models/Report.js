"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reportSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    opportunityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    inputType: { type: String, enum: ['text', 'screenshot', 'pdf', 'url'], required: true },
    originalSubmission: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    normalizedOpportunity: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    riskAnalysis: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    credibilityAnalysis: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    paymentVerification: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    suitabilityAnalysis: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    alternatives: { type: mongoose_1.Schema.Types.Mixed, default: [] },
    valueAnalysis: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    recommendation: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    evidenceLabels: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ opportunityId: 1 });
exports.Report = mongoose_1.default.model('Report', reportSchema);
//# sourceMappingURL=Report.js.map