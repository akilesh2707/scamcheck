"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const UserProfile_1 = require("../models/UserProfile");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class AuthService {
    async register(email, password, name) {
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new errors_1.ValidationError('Email already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await User_1.User.create({
            email: email.toLowerCase(),
            passwordHash,
            name,
        });
        await UserProfile_1.UserProfile.create({ userId: user._id });
        const token = this.generateToken(user);
        logger_1.logger.info('User registered', { userId: user._id, email });
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async login(email, password) {
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new errors_1.AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new errors_1.AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        user.lastLoginAt = new Date();
        await user.save();
        const token = this.generateToken(user);
        logger_1.logger.info('User logged in', { userId: user._id, email });
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async getMe(userId) {
        const user = await User_1.User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const profile = await UserProfile_1.UserProfile.findOne({ userId });
        return {
            ...this.sanitizeUser(user),
            profile: profile || null,
        };
    }
    async updateProfile(userId, data) {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (data.currentPassword && data.newPassword) {
            const isValid = await bcryptjs_1.default.compare(data.currentPassword, user.passwordHash);
            if (!isValid) {
                throw new errors_1.AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 401);
            }
            user.passwordHash = await bcryptjs_1.default.hash(data.newPassword, 12);
        }
        if (data.name) {
            user.name = data.name;
        }
        await user.save();
        return this.sanitizeUser(user);
    }
    async updateUserProfile(userId, profileData) {
        const profile = await UserProfile_1.UserProfile.findOneAndUpdate({ userId }, { $set: profileData }, { new: true, upsert: true });
        return profile;
    }
    async getUserProfile(userId) {
        return UserProfile_1.UserProfile.findOne({ userId });
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email, role: user.role }, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
    }
    sanitizeUser(user) {
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map