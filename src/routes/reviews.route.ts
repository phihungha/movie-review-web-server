import { Router } from 'express';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import {
  deleteReview,
  updateReview,
  getReview,
  thankReview,
} from '../controllers/reviews.controller';
import { param } from 'express-validator';
import requireAuth from '../middlewares/require-auth.middleware';

const router = Router();

router.get('/:id', param('id').toInt(), validationErrorHandler, getReview);

router.patch(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  requireAuth,
  updateReview,
);

router.delete(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  requireAuth,
  deleteReview,
);

router.put(
  '/:id/thanks',
  param('id').toInt(),
  validationErrorHandler,
  requireAuth,
  thankReview,
);

export default router;
