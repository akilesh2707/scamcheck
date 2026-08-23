"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const error_middleware_1 = require("./error.middleware");
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            next(new error_middleware_1.AppError('VALIDATION_ERROR', 'Invalid request data', 400, error.errors));
            return;
        }
        next(error);
    }
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map