import { Router } from 'express';
import { body, param } from 'express-validator';
import { createUniversity, getUniversities, getUniversityById } from '../controllers/universityController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getUniversities);
router.get('/:id', [param('id').isMongoId().withMessage('University id must be valid')], validate, getUniversityById);
router.post(
  '/',
  protect,
  requireAdmin,
  [
    body('name').isString().trim().isLength({ min: 2, max: 120 }),
    body('city').isString().trim().isLength({ min: 2, max: 80 }),
    body('logo').optional().isString(),
    body('description').optional().isString().isLength({ max: 1500 }),
    body('location').optional().isString(),
  ],
  validate,
  createUniversity
);

export default router;
