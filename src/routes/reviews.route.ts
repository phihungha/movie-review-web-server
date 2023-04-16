import { Router } from 'express';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import {
  deleteReview,
  updateReview,
  getReview,
} from '../controllers/reviews.controller';
import { param } from 'express-validator';
import passport from 'passport';

const router = Router();

router.get('/:id', param('id').toInt(), validationErrorHandler, getReview);

router.patch(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  updateReview,
);

router.delete(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  deleteReview,
);

export default router;
