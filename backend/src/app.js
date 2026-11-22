import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { sendSuccess } from './utils/apiResponse.js';

const app = express();

// Do not advertise the framework version in response headers.
app.disable('x-powered-by');

// Sensible security headers (HSTS, X-Content-Type-Options, etc.).
// Content Security Policy is disabled because Swagger UI uses inline assets.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * CORS configuration.
 *
 * In development we allow the React dev server (Vite on 5173 and CRA on 3000).
 * Requests without an Origin header (Postman, curl, server-to-server) are
 * allowed as well. Set CORS_ORIGIN in .env to a comma-separated list for
 * production, e.g. "https://myapp.com,https://www.myapp.com".
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools that do not send an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) {
        return callback(null, true);
      }

      const corsError = new Error(`Origin ${origin} is not allowed by CORS`);
      corsError.statusCode = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body size limit protects the server from huge payloads.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * @openapi
 * /:
 *   get:
 *     summary: API information
 *     description: Returns a welcome message with links to the documentation and health check.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Basic API information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Social Media API is running
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     docs:
 *                       type: string
 *                       example: http://localhost:5000/api-docs
 *                     health:
 *                       type: string
 *                       example: http://localhost:5000/api/health
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
app.get('/', (_req, res) =>
  sendSuccess(res, {
    message: 'Social Media API is running',
    data: {
      version: '1.0.0',
      docs: `http://localhost:${env.port}/api-docs`,
      health: `http://localhost:${env.port}/api/health`,
    },
  })
);

// Interactive Swagger UI. `persistAuthorization` keeps the Bearer token when
// the page is reloaded, which is convenient while developing.
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Social Media API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
  })
);

/**
 * @openapi
 * /api-docs.json:
 *   get:
 *     summary: Download the raw OpenAPI document
 *     description: |
 *       Returns the generated OpenAPI 3.0 JSON. Useful for importing the API
 *       into Postman, Insomnia, or for generating a typed frontend client.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: The OpenAPI 3.0 document as JSON.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
// Raw OpenAPI document (useful for Postman / Insomnia imports).
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// All application endpoints live under /api.
app.use('/api', routes);

// 404 for unknown routes, then the centralized error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
