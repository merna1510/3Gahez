/**
 * Test environment.
 *
 * This file is loaded by Vitest before any test file (and is also imported
 * explicitly at the top of each test) so that the application reads the test
 * configuration instead of the development .env file.
 *
 * The tests use a REAL MongoDB database (not mocks). They never touch the
 * development database because the name ends in `_test`.
 */
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '5000';
process.env.MONGODB_URI =
  process.env.MONGODB_URI_TEST ||
  'mongodb://127.0.0.1:27017/social_media_api_test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET_TEST ||
  'test-only-jwt-secret-that-is-longer-than-32-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';
