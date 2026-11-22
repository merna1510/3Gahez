import { body } from 'express-validator';

/**
 * Validation chains for post endpoints.
 */

export const createPostRules = [
  body('content')
    .exists({ values: 'falsy' })
    .withMessage('Post content is required')
    .bail()
    .isString()
    .withMessage('Post content must be a string')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),

  body('image')
    .optional({ values: 'falsy' })
    .isURL({ require_protocol: true })
    .withMessage('Image must be a valid URL including http:// or https://'),
];

export const updatePostRules = [
  body('content')
    .optional()
    .isString()
    .withMessage('Post content must be a string')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),

  body('image')
    .optional({ values: 'falsy' })
    .isURL({ require_protocol: true })
    .withMessage('Image must be a valid URL including http:// or https://'),

  // A PUT with an empty body would otherwise silently do nothing.
  body().custom((value) => {
    if (
      !value ||
      (value.content === undefined && value.image === undefined)
    ) {
      throw new Error('Provide at least one field to update: content or image');
    }
    return true;
  }),
];
