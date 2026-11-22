import swaggerJsdoc from 'swagger-jsdoc';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Base OpenAPI definition.
 *
 * Every endpoint is documented with JSDoc annotations directly above its route
 * (see src/routes/*.js). `swagger-jsdoc` collects those blocks at startup.
 */
const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Social Media REST API',
    version: '1.0.0',
    description: `
A complete, beginner-friendly social media backend built with **Node.js**, **Express**,
**MongoDB**, **Mongoose** and **JWT authentication**.

## What you can do

* Register and log in to receive a JWT.
* Read and update your own profile.
* Publish, read, update and delete posts (only the owner can modify a post).
* Browse users and posts with pagination.

## Authentication

1. Call \`POST /api/auth/register\` or \`POST /api/auth/login\`.
2. Copy the \`token\` value from the response.
3. Click the **Authorize** button, paste the token and confirm.
   Swagger UI automatically sends it as \`Authorization: Bearer <token>\`.
4. Protected endpoints now work until the token expires.

You can also send the header manually:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

Tokens are signed with \`JWT_SECRET\` and expire after \`JWT_EXPIRES_IN\` (default: 7 days).

## Response format

**Success**

\`\`\`json
{ "success": true, "message": "Post created successfully", "data": { "post": {} } }
\`\`\`

**Error**

\`\`\`json
{ "success": false, "message": "Something went wrong", "errors": [] }
\`\`\`

\`errors\` is always an array. Validation errors contain \`{ "field": "email", "message": "..." }\`.
`,
    contact: {
      name: 'Social Media API',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health and API information.' },
    { name: 'Auth', description: 'Registration, login and the current user.' },
    { name: 'Users', description: 'Public profiles and account management.' },
    { name: 'Posts', description: 'Create and manage social media posts.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste the JWT returned by /api/auth/register or /api/auth/login. ' +
          'Do not include the word "Bearer" in Swagger — it is added automatically.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        description: 'Authenticated user object. The password is never returned.',
        properties: {
          _id: { type: 'string', example: '665f1c2a9b1e8a0012a4c111' },
          name: { type: 'string', example: 'Ada Lovelace' },
          username: { type: 'string', example: 'ada_lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          profilePicture: {
            type: 'string',
            example: 'https://example.com/avatars/ada.png',
          },
          bio: { type: 'string', example: 'Mathematician. First programmer.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PublicUser: {
        type: 'object',
        description:
          'Public profile shown to other users. Email is hidden for privacy.',
        properties: {
          _id: { type: 'string', example: '665f1c2a9b1e8a0012a4c111' },
          name: { type: 'string', example: 'Ada Lovelace' },
          username: { type: 'string', example: 'ada_lovelace' },
          profilePicture: {
            type: 'string',
            example: 'https://example.com/avatars/ada.png',
          },
          bio: { type: 'string', example: 'Mathematician. First programmer.' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1c2a9b1e8a0012a4c222' },
          user: {
            oneOf: [
              { type: 'string', example: '665f1c2a9b1e8a0012a4c111' },
              { $ref: '#/components/schemas/PublicUser' },
            ],
            description: 'Post author (populated on read endpoints).',
          },
          content: { type: 'string', example: 'Hello world, this is my first post!' },
          image: {
            type: 'string',
            example: 'https://example.com/images/sunset.jpg',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Registration successful' },
          data: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
          errors: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Email is required' },
                  },
                },
              ],
            },
            example: [],
          },
        },
      },
    },
    parameters: {
      PageParam: {
        in: 'query',
        name: 'page',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number (1-based).',
      },
      LimitParam: {
        in: 'query',
        name: 'limit',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        description: 'Number of items per page (max 100).',
      },
      PostIdParam: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', example: '665f1c2a9b1e8a0012a4c222' },
        description: 'MongoDB ObjectId of the post.',
      },
      UserIdParam: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', example: '665f1c2a9b1e8a0012a4c111' },
        description: 'MongoDB ObjectId of the user.',
      },
    },
    responses: {
      ValidationError: {
        description: 'Request validation failed (HTTP 400).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Validation failed',
              errors: [
                { field: 'email', message: 'A valid email is required' },
                { field: 'password', message: 'Password must be at least 8 characters' },
              ],
            },
          },
        },
      },
      Unauthorized: {
        description: 'Missing, invalid or expired JWT (HTTP 401).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Authentication required. Provide a valid Bearer token.',
              errors: [],
            },
          },
        },
      },
      Forbidden: {
        description: 'You do not have permission to perform this action (HTTP 403).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'You are not allowed to modify this post',
              errors: [],
            },
          },
        },
      },
      NotFound: {
        description: 'The requested resource does not exist (HTTP 404).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Post not found',
              errors: [],
            },
          },
        },
      },
      Conflict: {
        description: 'A unique value is already in use (HTTP 409).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Email is already registered',
              errors: [],
            },
          },
        },
      },
      ServerError: {
        description:
          'Unexpected server error (HTTP 500). Details are logged on the server, never returned to the client.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Something went wrong on the server',
              errors: [],
            },
          },
        },
      },
    },
  },
};

// glob v11 requires forward slashes, including on Windows.
const toGlobPath = (...parts) =>
  join(__dirname, ...parts).replace(/\\/g, '/');

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: [toGlobPath('..', 'routes', '*.js'), toGlobPath('..', 'app.js')],
});
