import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import universityRoutes from './universityRoutes.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: |
 *       Lightweight endpoint used to confirm that the API is running.
 *       Useful for uptime monitors and for checking the connection from React.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: The API is healthy.
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
 *                   example: API is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: '2026-01-01T10:00:00.000Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/health', (_req, res) =>
  sendSuccess(res, {
    message: 'API is healthy',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/universities', universityRoutes);

export default router;
