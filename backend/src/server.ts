import { createApp } from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { initRateLimiter } from './middleware/rateLimit.middleware';

const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    await initRateLimiter();

    const app = createApp();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();