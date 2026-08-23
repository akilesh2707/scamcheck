import { z } from 'zod';
export declare const isPrivateIP: (hostname: string) => boolean;
export declare const validateUrl: (url: string) => {
    valid: boolean;
    error?: string;
};
export declare const urlSchema: z.ZodObject<{
    body: z.ZodObject<{
        url: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        url: string;
    };
}, {
    body: {
        url: string;
    };
}>;
//# sourceMappingURL=url.validator.d.ts.map