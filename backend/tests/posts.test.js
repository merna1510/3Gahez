import './setupEnv.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Post from '../src/models/Post.js';
import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
  registerTestUser,
} from './helpers.js';

// Shared accounts used across the post tests.
let owner;
let otherUser;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Posts API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    owner = await registerTestUser(app);
    otherUser = await registerTestUser(app);
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it('creates a post owned by the authenticated user', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'My first post!' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Post created successfully');
    expect(response.body.data.post.content).toBe('My first post!');
    expect(response.body.data.post.user._id).toBe(owner.user._id);
    expect(response.body.data.post.user).not.toHaveProperty('password');
    expect(response.body.data.post.user).not.toHaveProperty('email');
  });

  it('rejects creating a post without authentication', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ content: 'Anonymous post' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects a post with empty content', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('ignores an author supplied in the request body', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Trying to spoof the author', user: otherUser.user._id });

    expect(response.status).toBe(201);
    expect(response.body.data.post.user._id).toBe(owner.user._id);
    expect(response.body.data.post.user._id).not.toBe(otherUser.user._id);
  });

  it('returns all posts newest first with pagination metadata', async () => {
    // Insert directly with controlled timestamps to verify sorting reliably.
    await Post.collection.insertMany([
      {
        user: new mongoose.Types.ObjectId(owner.user._id),
        content: 'Oldest post',
        image: '',
        createdAt: new Date(Date.now() - 3000),
        updatedAt: new Date(Date.now() - 3000),
      },
      {
        user: new mongoose.Types.ObjectId(owner.user._id),
        content: 'Middle post',
        image: '',
        createdAt: new Date(Date.now() - 2000),
        updatedAt: new Date(Date.now() - 2000),
      },
      {
        user: new mongoose.Types.ObjectId(otherUser.user._id),
        content: 'Newest post',
        image: '',
        createdAt: new Date(Date.now() - 1000),
        updatedAt: new Date(Date.now() - 1000),
      },
    ]);

    const response = await request(app).get('/api/posts?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.data.posts).toHaveLength(2);
    expect(response.body.data.posts[0].content).toBe('Newest post');
    expect(response.body.data.posts[1].content).toBe('Middle post');
    expect(response.body.data.posts[0].user).toMatchObject({
      _id: otherUser.user._id,
    });
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });

    const secondPage = await request(app).get('/api/posts?page=2&limit=2');
    expect(secondPage.body.data.posts).toHaveLength(1);
    expect(secondPage.body.data.posts[0].content).toBe('Oldest post');
    expect(secondPage.body.meta.hasNextPage).toBe(false);
  });

  it('gets a single post by id', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Read me' });

    const response = await request(app).get(
      `/api/posts/${created.body.data.post._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.post.content).toBe('Read me');
    expect(response.body.data.post.user.username).toBe(owner.user.username);
  });

  it('returns 404 for a valid but unknown post id', async () => {
    const response = await request(app).get(
      `/api/posts/${new mongoose.Types.ObjectId()}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found');
  });

  it('returns 400 for an invalid post id', async () => {
    const response = await request(app).get('/api/posts/not-an-id');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('updates a post owned by the authenticated user', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Before update' });

    const response = await request(app)
      .put(`/api/posts/${created.body.data.post._id}`)
      .set(auth(owner.token))
      .send({ content: 'After update' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Post updated successfully');
    expect(response.body.data.post.content).toBe('After update');
  });

  it('prevents another user from updating a post', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Owner post' });

    const response = await request(app)
      .put(`/api/posts/${created.body.data.post._id}`)
      .set(auth(otherUser.token))
      .send({ content: 'Hijacked!' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/not allowed/i);

    // The original content must be unchanged.
    const unchanged = await Post.findById(created.body.data.post._id);
    expect(unchanged.content).toBe('Owner post');
  });

  it('prevents another user from deleting a post', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Do not delete me' });

    const response = await request(app)
      .delete(`/api/posts/${created.body.data.post._id}`)
      .set(auth(otherUser.token));

    expect(response.status).toBe(403);
    expect(await Post.exists({ _id: created.body.data.post._id })).toBeTruthy();
  });

  it('rejects updating without authentication', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Protected post' });

    const response = await request(app)
      .put(`/api/posts/${created.body.data.post._id}`)
      .send({ content: 'Nope' });

    expect(response.status).toBe(401);
  });

  it('deletes a post owned by the authenticated user', async () => {
    const created = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Delete me' });

    const postId = created.body.data.post._id;

    const response = await request(app)
      .delete(`/api/posts/${postId}`)
      .set(auth(owner.token));

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Post deleted successfully');
    expect(await Post.exists({ _id: postId })).toBeNull();

    const afterDelete = await request(app).get(`/api/posts/${postId}`);
    expect(afterDelete.status).toBe(404);
  });

  it('returns all posts created by a specific user', async () => {
    await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Owner one' });
    await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ content: 'Owner two' });
    await request(app)
      .post('/api/posts')
      .set(auth(otherUser.token))
      .send({ content: 'Other user post' });

    const response = await request(app).get(
      `/api/posts/user/${owner.user._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.posts).toHaveLength(2);
    expect(response.body.data.author.username).toBe(owner.user.username);
    expect(
      response.body.data.posts.every(
        (post) => post.user._id === owner.user._id
      )
    ).toBe(true);
    expect(response.body.meta.total).toBe(2);
  });

  it('returns 404 when requesting posts of a non-existent user', async () => {
    const response = await request(app).get(
      `/api/posts/user/${new mongoose.Types.ObjectId()}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
