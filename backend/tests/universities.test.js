import './setupEnv.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import University from '../src/models/University.js';
import Place from '../src/models/Place.js';
import { clearTestDB, connectTestDB, disconnectTestDB, registerTestUser } from './helpers.js';

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Universities API', () => {
  beforeAll(connectTestDB);
  beforeEach(clearTestDB);
  afterAll(disconnectTestDB);

  it('lists universities with the number of campus places', async () => {
    const university = await University.create({ name: 'Test University', city: 'Cairo' });
    await Place.create({ name: 'Campus Cafe', universityId: university._id, type: 'drinks' });

    const response = await request(app).get('/api/universities');
    expect(response.status).toBe(200);
    expect(response.body.data.universities[0]).toMatchObject({ name: 'Test University', placesCount: 1 });
  });

  it('returns university details and its places', async () => {
    const university = await University.create({ name: 'Campus University', city: 'Giza' });
    await Place.create({ name: 'Food Corner', universityId: university._id, type: 'meals' });

    const response = await request(app).get(`/api/universities/${university._id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.university.places).toHaveLength(1);
    expect(response.body.data.university.places[0].name).toBe('Food Corner');
  });

  it('allows only an admin to create a university', async () => {
    const { token, user } = await registerTestUser(app);
    const responseAsStudent = await request(app).post('/api/universities').set(auth(token)).send({ name: 'New University', city: 'Cairo' });
    expect(responseAsStudent.status).toBe(403);

    await User.findByIdAndUpdate(user._id, { role: 'admin' });
    const adminTokenResponse = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password123!' });
    const responseAsAdmin = await request(app).post('/api/universities').set(auth(adminTokenResponse.body.data.token)).send({ name: 'New University', city: 'Cairo' });
    expect(responseAsAdmin.status).toBe(201);
    expect(responseAsAdmin.body.data.university.name).toBe('New University');
  });
});
