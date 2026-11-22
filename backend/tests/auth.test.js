import './setupEnv.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
  registerTestUser,
} from './helpers.js';

describe('Authentication API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('registers a new user and returns a JWT without the password', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      username: 'ada_lovelace',
      email: 'ada@example.com',
      password: 'Secret123!',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      name: 'Ada Lovelace',
      username: 'ada_lovelace',
      email: 'ada@example.com',
    });
    expect(response.body.data.user).not.toHaveProperty('password');

    // The stored password must be a bcrypt hash, never plaintext.
    const storedUser = await User.findOne({ email: 'ada@example.com' }).select(
      '+password'
    );
    expect(storedUser.password).not.toBe('Secret123!');
    expect(storedUser.password.startsWith('$2')).toBe(true);
  });

  it('rejects a duplicate email', async () => {
    await registerTestUser(app, {
      email: 'duplicate@example.com',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      username: 'another_user',
      email: 'duplicate@example.com',
      password: 'Secret123!',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/email/i);
  });

  it('rejects a duplicate username', async () => {
    await registerTestUser(app, {
      username: 'same_username',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      username: 'same_username',
      email: 'unique-email@example.com',
      password: 'Secret123!',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/username/i);
  });

  it('returns validation errors for missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(response.body.errors[0]).toHaveProperty('field');
  });

  it('logs in with valid credentials', async () => {
    const { payload } = await registerTestUser(app);

    const response = await request(app).post('/api/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe(payload.email);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('rejects a wrong password', async () => {
    const { payload } = await registerTestUser(app);

    const response = await request(app).post('/api/auth/login').send({
      email: payload.email,
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('returns the current user for a valid token', async () => {
    const { token, payload } = await registerTestUser(app);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(payload.email);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('also exposes the current user at /api/users/me for the project contract', async () => {
    const { token, payload } = await registerTestUser(app);
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(payload.email);
  });

  it('rejects a request without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual([]);
  });

  it('rejects an invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.not-a-valid-jwt');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('never exposes a password field in the database JSON output', async () => {
    await registerTestUser(app, { email: 'safe@example.com' });

    const user = await User.findOne({ email: 'safe@example.com' }).select(
      '+password'
    );

    expect(user.toJSON()).not.toHaveProperty('password');
  });

  it('ignores a token whose user was deleted', async () => {
    const { token, user } = await registerTestUser(app);

    await User.findByIdAndDelete(user._id);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(mongoose.connection.readyState).toBe(1);
  });
});
