"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: 'Invalid email format' }),
        password: zod_1.z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
            .regex(/[0-9]/, { message: 'Password must contain at least one number' })
            .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
        name: zod_1.z.string().min(1).max(100).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: 'Invalid email format' }),
        password: zod_1.z.string().min(1, { message: 'Password is required' }),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        currentPassword: zod_1.z.string().optional(),
        newPassword: zod_1.z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
            .regex(/[0-9]/, { message: 'Password must contain at least one number' })
            .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
            .optional(),
    }).refine((data) => !(data.currentPassword && !data.newPassword), { message: 'New password is required when current password is provided', path: ['newPassword'] }),
});
//# sourceMappingURL=auth.validator.js.map