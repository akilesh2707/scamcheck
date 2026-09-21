import mongoose from 'mongoose';
import { config } from './env';

let mongoServer: any = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected successfully');
  } catch (error) {
    if (config.nodeEnv === 'production') {
      console.error('MongoDB connection error in production:', error);
      throw error;
    }
    console.log('MongoDB connection error. Starting fallback in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Fallback in-memory MongoDB connected at ' + uri);
    } catch (err) {
      console.error('Failed to start fallback in-memory DB:', err);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('MongoDB disconnected');
};