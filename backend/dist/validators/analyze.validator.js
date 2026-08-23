"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentVerifySchema = exports.alternativesSchema = exports.skillGapSchema = exports.suitabilitySchema = exports.analyzeSchema = void 0;
const zod_1 = require("zod");
exports.analyzeSchema = zod_1.z.object({
    body: zod_1.z.object({
        inputType: zod_1.z.enum(['text', 'screenshot', 'pdf', 'url']),
        text: zod_1.z.string().optional(),
        url: zod_1.z.string().url().optional(),
        userProfile: zod_1.z.object({
            education: zod_1.z.array(zod_1.z.string()).optional(),
            skills: zod_1.z.array(zod_1.z.string()).optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
            careerGoals: zod_1.z.array(zod_1.z.string()).optional(),
            experience: zod_1.z.array(zod_1.z.string()).optional(),
            budget: zod_1.z.number().min(0).optional(),
            availableTime: zod_1.z.string().optional(),
            preferredLearningMode: zod_1.z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
        }).optional(),
    }).refine((data) => {
        if (data.inputType === 'text')
            return !!data.text && data.text.length > 0;
        if (data.inputType === 'url')
            return !!data.url && data.url.length > 0;
        return true;
    }, {
        message: 'Text is required for text input type, URL is required for url input type',
        path: ['text'],
    }),
});
exports.suitabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        opportunityId: zod_1.z.string().optional(),
        opportunity: zod_1.z.object({
            type: zod_1.z.string().optional(),
            organization: zod_1.z.object({
                name: zod_1.z.string().optional(),
                email: zod_1.z.string().email().optional(),
                website: zod_1.z.string().url().optional(),
            }).optional(),
            role: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            fees: zod_1.z.object({
                registration: zod_1.z.number().optional(),
                processing: zod_1.z.number().optional(),
                securityDeposit: zod_1.z.number().optional(),
                placement: zod_1.z.number().optional(),
                certificate: zod_1.z.number().optional(),
                training: zod_1.z.number().optional(),
                currency: zod_1.z.string().optional(),
            }).optional(),
            stipend: zod_1.z.object({
                amount: zod_1.z.number().optional(),
                currency: zod_1.z.string().optional(),
                period: zod_1.z.enum(['month', 'week', 'year', 'one-time']).optional(),
            }).optional(),
            skills: zod_1.z.array(zod_1.z.string()).optional(),
            eligibility: zod_1.z.array(zod_1.z.string()).optional(),
            duration: zod_1.z.string().optional(),
        }).optional(),
        userProfile: zod_1.z.object({
            education: zod_1.z.array(zod_1.z.string()).optional(),
            skills: zod_1.z.array(zod_1.z.string()).optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
            careerGoals: zod_1.z.array(zod_1.z.string()).optional(),
            experience: zod_1.z.array(zod_1.z.string()).optional(),
            budget: zod_1.z.number().min(0).optional(),
            availableTime: zod_1.z.string().optional(),
            preferredLearningMode: zod_1.z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
        }),
    }).refine((data) => data.opportunityId || data.opportunity, { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }),
});
exports.skillGapSchema = zod_1.z.object({
    body: zod_1.z.object({
        opportunityId: zod_1.z.string().optional(),
        requiredSkills: zod_1.z.array(zod_1.z.string()).min(1),
        userSkills: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.alternativesSchema = zod_1.z.object({
    body: zod_1.z.object({
        opportunityId: zod_1.z.string().optional(),
        opportunity: zod_1.z.object({
            type: zod_1.z.string().optional(),
            role: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            skills: zod_1.z.array(zod_1.z.string()).optional(),
            fees: zod_1.z.object({
                registration: zod_1.z.number().optional(),
                training: zod_1.z.number().optional(),
                currency: zod_1.z.string().optional(),
            }).optional(),
        }).optional(),
        userProfile: zod_1.z.object({
            budget: zod_1.z.number().min(0).optional(),
            skills: zod_1.z.array(zod_1.z.string()).optional(),
            preferredLearningMode: zod_1.z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
        }).optional(),
        limit: zod_1.z.number().min(1).max(50).default(10),
    }).refine((data) => data.opportunityId || data.opportunity, { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }),
});
exports.paymentVerifySchema = zod_1.z.object({
    body: zod_1.z.object({
        opportunityId: zod_1.z.string().optional(),
        opportunity: zod_1.z.object({
            fees: zod_1.z.object({
                registration: zod_1.z.number().optional(),
                processing: zod_1.z.number().optional(),
                securityDeposit: zod_1.z.number().optional(),
                placement: zod_1.z.number().optional(),
                certificate: zod_1.z.number().optional(),
                training: zod_1.z.number().optional(),
                currency: zod_1.z.string().optional(),
            }).optional(),
            organization: zod_1.z.object({
                name: zod_1.z.string().optional(),
                website: zod_1.z.string().url().optional(),
                email: zod_1.z.string().email().optional(),
            }).optional(),
            claimedBenefits: zod_1.z.array(zod_1.z.string()).optional(),
        }).optional(),
        claimedAmount: zod_1.z.number().min(0).optional(),
        claimedPurpose: zod_1.z.string().optional(),
    }).refine((data) => data.opportunityId || data.opportunity, { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }),
});
//# sourceMappingURL=analyze.validator.js.map