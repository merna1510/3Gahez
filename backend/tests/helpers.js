import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB } from '../src/config/db.js';

let memoryServer;

/**
 * Connect to a real MongoDB database.
 *
 * By default the tests use a separate local database named
 * `social_media_api_test`. Set MONGODB_URI_TEST to point at another MongoDB.
 * If no local MongoDB is available, an isolated real MongoDB process is
 * started with mongodb-memory-server. No database or data is mocked.
 */
export const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return;
  }

  if (process.env.MONGODB_URI_TEST) {
    await connectDB(process.env.MONGODB_URI_TEST);
    return;
  }

  const localTestUri = 'mongodb://127.0.0.1:27017/social_media_api_test';

  try {
    await connectDB(localTestUri, { serverSelectionTimeoutMS: 2500 });
    return;
  } catch (error) {
    console.warn(
      `Local test MongoDB unavailable (${error.message}). ` +
        'Starting mongodb-memory-server instead.'
    );
  }

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'social_media_api_test',
      launchTimeout: 120000,
    },
  });

  await connectDB(memoryServer.getUri('social_media_api_test'));
};

/**
 * Remove every document from every collection between tests so each test
 * starts from a clean, independent state.
 */
export const clearTestDB = async () => {
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
};

/**
 * Drop the test database and close the connection.
 */
export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
};

/**
 * Registers a user through the real API and returns { token, user }.
 *
 * @param {import('express').Express} app Express app to send requests to.
 * @param {{name?: string, username?: string, email?: string, password?: string}} overrides
 */
export const registerTestUser = async (app, overrides = {}) => {
  const suffix = Math.random().toString(36).slice(2, 8);

  const payload = {
    name: 'Test User',
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: 'Password123!',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/register').send(payload);

  return {
    response,
    payload,
    token: response.body?.data?.token,
    user: response.body?.data?.user,
  };
};
