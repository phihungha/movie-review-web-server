import { Router } from 'express';
import validationErrorHandler from '../middlewares/validation-response.middleware';
import { deleteReview, getReview } from '../controllers/reviews.controller';
import { param } from 'express-validator';
import passport from 'passport';

const router = Router();

router.get('/:id', param('id').toInt(), validationErrorHandler, getReview);

router.delete(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  deleteReview,
);

export default router;
