import { Router } from 'express';
import { param } from 'express-validator';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getViewedMoviesOfUser,
} from '../controllers/users.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';

const router = Router();

router.get(
  '/:id/viewed-movies',
  param('id').toInt(),
  validationErrorHandler,
  getViewedMoviesOfUser,
);

router.get(
  '/:id/reviews',
  param('id').toInt(),
  validationErrorHandler,
  getReviewsOfUser,
);

router.get(
  '/:id/thanked-reviews',
  param('id').toInt(),
  validationErrorHandler,
  getThankedReviewsOfUser,
);

export default router;
