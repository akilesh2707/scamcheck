import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { initRateLimiter } from './middleware/rateLimit.middleware';

import analyzeRoutes from './routes/analyze.routes';
import authRoutes from './routes/auth.routes';
import suitabilityRoutes from './routes/suitability.routes';
import skillGapRoutes from './routes/skillGap.routes';
import alternativesRoutes from './routes/alternatives.routes';
import paymentRoutes from './routes/payment.routes';
import websiteRoutes from './routes/website.routes';
import companyRoutes from './routes/company.routes';
import reportRoutes from './routes/report.routes';

import { requestContextMiddleware } from './middleware/requestContext.middleware';

export const createApp = (): express.Application => {
  const app = express();

  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = config.cors.allowedOrigins;

      if (allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'scamcheck-backend', status: 'healthy' });
  });

  app.get('/api/ready', async (req, res) => {
    try {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.connection.readyState !== 1) {
        res.status(503).json({ success: false, status: 'unavailable', reason: 'db' });
        return;
      }
      res.json({ success: true, status: 'ready' });
    } catch {
      res.status(503).json({ success: false, status: 'unavailable' });
    }
  });

  app.get('/api', (req, res) => {
    res.json({
      name: 'ScamCheck API',
      version: '1.0.0',
      status: 'operational',
    });
  });

  app.use('/api/analyze', analyzeRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/analyze/suitability', suitabilityRoutes);
  app.use('/api/analyze/skill-gap', skillGapRoutes);
  app.use('/api/find/alternatives', alternativesRoutes);
  app.use('/api/verify/payment', paymentRoutes);
  app.use('/api/website', websiteRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/report', reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const startServer = async () => {
  const { connectDatabase, disconnectDatabase } = await import('./config/database');
  await connectDatabase();

  await initRateLimiter();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force close if it takes too long
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}