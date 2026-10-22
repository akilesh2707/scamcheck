import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import crypto from 'crypto';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { config } from '../config/env';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: config.redis.url,
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: (retries) => {
      if (retries > 2) {
        return new Error('Redis connection retries exhausted');
      }
      return Math.min(retries * 50, 200);
    },
  },
});
redisClient.on('error', (err) => logger.error('Auth redis error', { error: err.message }));
redisClient.connect().catch(() => {});

export const closeAuthRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    } else {
      await redisClient.disconnect();
    }
  } catch (e) {
    void e;
  }
};

export class AuthService {
  async register(email: string, password: string, name?: string): Promise<{ user: any; token: string }> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
    });

    await UserProfile.create({ userId: user._id });

    const token = this.generateToken(user);
    logger.info('User registered', { userId: user._id, email });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    logger.info('User logged in', { userId: user._id, email });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const profile = await UserProfile.findOne({ userId });

    return {
      ...this.sanitizeUser(user),
      profile: profile || null,
    };
  }

  async updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.currentPassword && data.newPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 401);
      }
      user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (data.name) {
      user.name = data.name;
    }

    await user.save();
    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true, upsert: true }
    );
    return profile;
  }

  async getUserProfile(userId: string): Promise<any> {
    return UserProfile.findOne({ userId });
  }

  async generatePairingCode(userId: string): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    await redisClient.setEx(`pairing:${code}`, 300, userId); // 5 minutes expiry
    logger.info('Generated extension pairing code', { userId });
    return code;
  }

  async exchangePairingCode(code: string): Promise<string> {
    const userId = await redisClient.get(`pairing:${code}`);
    if (!userId) {
      throw new AppError('INVALID_CODE', 'Invalid or expired pairing code', 400);
    }

    await redisClient.del(`pairing:${code}`);

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info('Exchanged extension pairing code', { userId });
    return this.generateExtensionToken(user);
  }

  private generateToken(user: any): string {
    return jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, type: 'web' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any, audience: 'scamcheck-web' }
    );
  }

  private generateExtensionToken(user: any): string {
    return jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, type: 'extension' },
      config.jwt.secret,
      { expiresIn: '14d', audience: 'scamcheck-extension', jwtid: crypto.randomUUID() }
    );
  }

  private sanitizeUser(user: any): any {
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

export const authService = new AuthService();