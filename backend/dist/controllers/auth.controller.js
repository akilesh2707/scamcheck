"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../utils/logger");
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const result = await auth_service_1.authService.register(email, password, name);
            const response = {
                success: true,
                data: result,
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.logger.error('Register error', { error: error.message });
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.authService.login(email, password);
            const response = {
                success: true,
                data: result,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Login error', { error: error.message });
            next(error);
        }
    }
    async me(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                };
                res.status(401).json(response);
                return;
            }
            const user = await auth_service_1.authService.getMe(userId);
            const response = {
                success: true,
                data: user,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Get me error', { error: error.message });
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                };
                res.status(401).json(response);
                return;
            }
            const user = await auth_service_1.authService.updateProfile(userId, req.body);
            const response = {
                success: true,
                data: user,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Update profile error', { error: error.message });
            next(error);
        }
    }
    async updateUserProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                };
                res.status(401).json(response);
                return;
            }
            const profile = await auth_service_1.authService.updateUserProfile(userId, req.body);
            const response = {
                success: true,
                data: profile,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Update user profile error', { error: error.message });
            next(error);
        }
    }
    async getUserProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                };
                res.status(401).json(response);
                return;
            }
            const profile = await auth_service_1.authService.getUserProfile(userId);
            const response = {
                success: true,
                data: profile,
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Get user profile error', { error: error.message });
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map