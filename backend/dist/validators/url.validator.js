"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlSchema = exports.validateUrl = exports.isPrivateIP = void 0;
const zod_1 = require("zod");
const BLOCKED_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
];
const BLOCKED_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^127\./,
    /^::1$/,
    /^fe80::/,
];
const CLOUD_METADATA_HOSTS = [
    '169.254.169.254',
    'metadata.google.internal',
    'metadata.azure.com',
    '169.254.169.250',
];
const isPrivateIP = (hostname) => {
    if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) {
        return true;
    }
    if (BLOCKED_IP_RANGES.some((regex) => regex.test(hostname))) {
        return true;
    }
    if (CLOUD_METADATA_HOSTS.includes(hostname)) {
        return true;
    }
    return false;
};
exports.isPrivateIP = isPrivateIP;
const validateUrl = (url) => {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
        }
        if ((0, exports.isPrivateIP)(parsed.hostname)) {
            return { valid: false, error: 'Private and local addresses are not allowed' };
        }
        return { valid: true };
    }
    catch {
        return { valid: false, error: 'Invalid URL format' };
    }
};
exports.validateUrl = validateUrl;
exports.urlSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().refine((url) => (0, exports.validateUrl)(url).valid, { message: 'Invalid or blocked URL' }),
    }),
});
//# sourceMappingURL=url.validator.js.map