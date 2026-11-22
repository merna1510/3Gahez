import './setupEnv.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Post from '../src/models/Post.js';
import User from '../src/models/User.js';
import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
  registerTestUser,
} from './helpers.js';

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Users API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('lists users with pagination and hides private emails', async () => {
    await registerTestUser(app);
    await registerTestUser(app);
    await registerTestUser(app);

    const response = await request(app).get('/api/users?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.data.users).toHaveLength(2);
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(response.body.data.users[0]).not.toHaveProperty('email');
    expect(response.body.data.users[0]).not.toHaveProperty('password');
  });

  it("gets a user's public profile by id", async () => {
    const { user } = await registerTestUser(app);

    const response = await request(app).get(`/api/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      _id: user._id,
      username: user.username,
    });
    expect(response.body.data.user).not.toHaveProperty('email');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('updates the authenticated user profile', async () => {
    const { token } = await registerTestUser(app);

    const response = await request(app)
      .put('/api/users/me')
      .set(auth(token))
      .send({
        name: 'Updated Name',
        bio: 'A short bio.',
        profilePicture: 'https://example.com/avatar.png',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      name: 'Updated Name',
      bio: 'A short bio.',
      profilePicture: 'https://example.com/avatar.png',
    });
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('rejects attempts to update protected fields', async () => {
    const { token, user } = await registerTestUser(app);

    const response = await request(app)
      .put('/api/users/me')
      .set(auth(token))
      .send({ role: 'admin', name: 'Hacker' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/protected field/i);

    const unchanged = await User.findById(user._id);
    expect(unchanged.name).toBe(user.name);
    expect(unchanged.role).toBe('student');
  });

  it('requires authentication to update a profile', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .send({ name: 'Anonymous' });

    expect(response.status).toBe(401);
  });

  it('deletes the account and all of its posts', async () => {
    const { token, user } = await registerTestUser(app);

    await request(app)
      .post('/api/posts')
      .set(auth(token))
      .send({ content: 'Post that should be removed' });

    const response = await request(app)
      .delete('/api/users/me')
      .set(auth(token));

    expect(response.status).toBe(200);
    expect(response.body.data.deletedPosts).toBe(1);
    expect(await User.exists({ _id: user._id })).toBeNull();
    expect(await Post.countDocuments({ user: user._id })).toBe(0);
  });

  it('returns 404 for a valid but unknown user id', async () => {
    const response = await request(app).get(
      '/api/users/665f1c2a9b1e8a0012a4c999'
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('returns 400 for an invalid user id', async () => {
    const response = await request(app).get('/api/users/invalid-id');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
