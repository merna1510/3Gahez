import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB.
 *
 * @param {string} [uri] Optional connection string, useful for tests.
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (uri = env.mongodbUri, options = {}) => {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    // Keep the connection pool small and predictable for a learning project.
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    ...options,
  });

  const { host, port, name } = connection.connection;
  console.log(`MongoDB connected: ${host}:${port}/${name}`);

  return connection;
};

/**
 * Close the MongoDB connection. Used by the server shutdown handlers and tests.
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
};
