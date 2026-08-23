import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        name?: string | undefined;
    }, {
        password: string;
        email: string;
        name?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        name?: string | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        name?: string | undefined;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
    }, {
        password: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
    };
}, {
    body: {
        password: string;
        email: string;
    };
}>;
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        currentPassword: z.ZodOptional<z.ZodString>;
        newPassword: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    }, {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    }>, {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    }, {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        currentPassword?: string | undefined;
        newPassword?: string | undefined;
    };
}>;
//# sourceMappingURL=auth.validator.d.ts.map