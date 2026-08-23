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

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: config.nodeEnv === 'production' ? false : true,
    credentials: true,
  }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

export const startServer = async (): Promise<void> => {
  const { connectDatabase } = await import('./config/database');
  await connectDatabase();
  
  await initRateLimiter();

  const app = createApp();
  
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}