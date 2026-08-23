import { z } from 'zod';
export declare const analyzeSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        inputType: z.ZodEnum<["text", "screenshot", "pdf", "url"]>;
        text: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        userProfile: z.ZodOptional<z.ZodObject<{
            education: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            interests: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            careerGoals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            experience: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            budget: z.ZodOptional<z.ZodNumber>;
            availableTime: z.ZodOptional<z.ZodString>;
            preferredLearningMode: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE", "HYBRID"]>>;
        }, "strip", z.ZodTypeAny, {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }, {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    }, {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    }>, {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    }, {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    };
}, {
    body: {
        inputType: "text" | "screenshot" | "pdf" | "url";
        text?: string | undefined;
        url?: string | undefined;
        userProfile?: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
    };
}>;
export declare const suitabilitySchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        opportunityId: z.ZodOptional<z.ZodString>;
        opportunity: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            organization: z.ZodOptional<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                website: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>>;
            role: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            fees: z.ZodOptional<z.ZodObject<{
                registration: z.ZodOptional<z.ZodNumber>;
                processing: z.ZodOptional<z.ZodNumber>;
                securityDeposit: z.ZodOptional<z.ZodNumber>;
                placement: z.ZodOptional<z.ZodNumber>;
                certificate: z.ZodOptional<z.ZodNumber>;
                training: z.ZodOptional<z.ZodNumber>;
                currency: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }, {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }>>;
            stipend: z.ZodOptional<z.ZodObject<{
                amount: z.ZodOptional<z.ZodNumber>;
                currency: z.ZodOptional<z.ZodString>;
                period: z.ZodOptional<z.ZodEnum<["month", "week", "year", "one-time"]>>;
            }, "strip", z.ZodTypeAny, {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            }, {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            }>>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            eligibility: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            duration: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        }, {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        }>>;
        userProfile: z.ZodObject<{
            education: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            interests: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            careerGoals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            experience: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            budget: z.ZodOptional<z.ZodNumber>;
            availableTime: z.ZodOptional<z.ZodString>;
            preferredLearningMode: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE", "HYBRID"]>>;
        }, "strip", z.ZodTypeAny, {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }, {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    }, {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    }>, {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    }, {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    };
}, {
    body: {
        userProfile: {
            education?: string[] | undefined;
            skills?: string[] | undefined;
            interests?: string[] | undefined;
            careerGoals?: string[] | undefined;
            experience?: string[] | undefined;
            budget?: number | undefined;
            availableTime?: string | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        };
        opportunityId?: string | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            stipend?: {
                amount?: number | undefined;
                currency?: string | undefined;
                period?: "month" | "week" | "year" | "one-time" | undefined;
            } | undefined;
            eligibility?: string[] | undefined;
            duration?: string | undefined;
        } | undefined;
    };
}>;
export declare const skillGapSchema: z.ZodObject<{
    body: z.ZodObject<{
        opportunityId: z.ZodOptional<z.ZodString>;
        requiredSkills: z.ZodArray<z.ZodString, "many">;
        userSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        requiredSkills: string[];
        userSkills?: string[] | undefined;
        opportunityId?: string | undefined;
    }, {
        requiredSkills: string[];
        userSkills?: string[] | undefined;
        opportunityId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        requiredSkills: string[];
        userSkills?: string[] | undefined;
        opportunityId?: string | undefined;
    };
}, {
    body: {
        requiredSkills: string[];
        userSkills?: string[] | undefined;
        opportunityId?: string | undefined;
    };
}>;
export declare const alternativesSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        opportunityId: z.ZodOptional<z.ZodString>;
        opportunity: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            fees: z.ZodOptional<z.ZodObject<{
                registration: z.ZodOptional<z.ZodNumber>;
                training: z.ZodOptional<z.ZodNumber>;
                currency: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }, {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        }, {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        }>>;
        userProfile: z.ZodOptional<z.ZodObject<{
            budget: z.ZodOptional<z.ZodNumber>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            preferredLearningMode: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE", "HYBRID"]>>;
        }, "strip", z.ZodTypeAny, {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }, {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        }>>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        limit?: number | undefined;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    }>, {
        limit: number;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        limit?: number | undefined;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        limit: number;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    };
}, {
    body: {
        limit?: number | undefined;
        opportunityId?: string | undefined;
        userProfile?: {
            skills?: string[] | undefined;
            budget?: number | undefined;
            preferredLearningMode?: "ONLINE" | "OFFLINE" | "HYBRID" | undefined;
        } | undefined;
        opportunity?: {
            role?: string | undefined;
            type?: string | undefined;
            description?: string | undefined;
            skills?: string[] | undefined;
            fees?: {
                registration?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
        } | undefined;
    };
}>;
export declare const paymentVerifySchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        opportunityId: z.ZodOptional<z.ZodString>;
        opportunity: z.ZodOptional<z.ZodObject<{
            fees: z.ZodOptional<z.ZodObject<{
                registration: z.ZodOptional<z.ZodNumber>;
                processing: z.ZodOptional<z.ZodNumber>;
                securityDeposit: z.ZodOptional<z.ZodNumber>;
                placement: z.ZodOptional<z.ZodNumber>;
                certificate: z.ZodOptional<z.ZodNumber>;
                training: z.ZodOptional<z.ZodNumber>;
                currency: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }, {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            }>>;
            organization: z.ZodOptional<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                website: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }, {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            }>>;
            claimedBenefits: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        }, {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        }>>;
        claimedAmount: z.ZodOptional<z.ZodNumber>;
        claimedPurpose: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    }, {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    }>, {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    }, {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    };
}, {
    body: {
        opportunityId?: string | undefined;
        opportunity?: {
            organization?: {
                website?: string | undefined;
                name?: string | undefined;
                email?: string | undefined;
            } | undefined;
            fees?: {
                registration?: number | undefined;
                processing?: number | undefined;
                securityDeposit?: number | undefined;
                placement?: number | undefined;
                certificate?: number | undefined;
                training?: number | undefined;
                currency?: string | undefined;
            } | undefined;
            claimedBenefits?: string[] | undefined;
        } | undefined;
        claimedAmount?: number | undefined;
        claimedPurpose?: string | undefined;
    };
}>;
//# sourceMappingURL=analyze.validator.d.ts.map