import dotenv from 'dotenv';

// Load .env as early as possible. Importing this module is enough to make sure
// every other module sees the environment variables.
dotenv.config({ quiet: true });

/**
 * Reads an environment variable and throws a helpful error when a required
 * value is missing. This prevents the API from starting with insecure defaults.
 */
const required = (key) => {
  const value = process.env[key];

  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable "${key}". ` +
        'Copy .env.example to .env and fill in the values.'
    );
  }

  return value.trim();
};

const optional = (key, fallback) => {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
};

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number.parseInt(optional('PORT', '5000'), 10),
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  corsOrigins: optional('CORS_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  isTest: optional('NODE_ENV', 'development') === 'test',
};

// Fail fast on invalid configuration instead of behaving unpredictably later.
if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error('PORT must be a positive number.');
}

if (env.jwtSecret.length < 32 && !env.isTest) {
  // A short secret is easy to brute-force. Refuse to start in real environments.
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}
