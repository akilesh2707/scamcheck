"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const error_middleware_1 = require("./error.middleware");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_middleware_1.AppError('UNAUTHORIZED', 'No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        const user = await User_1.User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            throw new error_middleware_1.AppError('UNAUTHORIZED', 'User not found', 401);
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            next(error);
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_middleware_1.AppError('UNAUTHORIZED', 'Invalid token', 401));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new error_middleware_1.AppError('UNAUTHORIZED', 'Token expired', 401));
            return;
        }
        next(new error_middleware_1.AppError('UNAUTHORIZED', 'Authentication failed', 401));
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        const user = await User_1.User.findById(decoded.id).select('-passwordHash');
        if (user) {
            req.user = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            };
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            next(new error_middleware_1.AppError('UNAUTHORIZED', 'Authentication required', 401));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new error_middleware_1.AppError('FORBIDDEN', 'Insufficient permissions', 403));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map