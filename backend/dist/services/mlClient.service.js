"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mlClient = exports.MLClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class MLClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.config.mlService.url,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.response.use((response) => response, (error) => {
            logger_1.logger.error('ML Service error', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
            });
            throw new errors_1.ExternalServiceError('ML Service', error.message, error.response?.data);
        });
    }
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    async extractOpportunity(text) {
        try {
            const response = await this.client.post('/extract/opportunity', { text });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Opportunity extraction');
            }
            throw error;
        }
    }
    async analyzeRisk(opportunity) {
        try {
            const response = await this.client.post('/risk/analyze', { opportunity });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Risk analysis');
            }
            throw error;
        }
    }
    async analyzeCredibility(opportunity) {
        try {
            const response = await this.client.post('/credibility/analyze', { opportunity });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Credibility analysis');
            }
            throw error;
        }
    }
    async verifyPayment(opportunity) {
        try {
            const response = await this.client.post('/payment/verify', { opportunity });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Payment verification');
            }
            throw error;
        }
    }
    async analyzeSuitability(opportunity, userProfile) {
        try {
            const response = await this.client.post('/suitability/analyze', { opportunity, userProfile });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Suitability analysis');
            }
            throw error;
        }
    }
    async analyzeSkillGap(requiredSkills, userSkills) {
        try {
            const response = await this.client.post('/skill-gap/analyze', { requiredSkills, userSkills });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Skill gap analysis');
            }
            throw error;
        }
    }
    async findAlternatives(opportunity, userProfile) {
        try {
            const response = await this.client.post('/alternatives/find', { opportunity, userProfile });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Alternative discovery');
            }
            throw error;
        }
    }
    async extractCurriculum(text) {
        try {
            const response = await this.client.post('/extract/curriculum', { text });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('Curriculum extraction');
            }
            throw error;
        }
    }
    async ocrExtract(fileBase64, mimeType) {
        try {
            const response = await this.client.post('/ocr', { file: fileBase64, mimeType });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new errors_1.NotImplementedError('OCR extraction');
            }
            throw error;
        }
    }
}
exports.MLClient = MLClient;
exports.mlClient = new MLClient();
//# sourceMappingURL=mlClient.service.js.map