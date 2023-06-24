import { Router } from 'express';
import { param } from 'express-validator';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getUser,
  getViewedMoviesOfUser,
  getUsers,
} from '../controllers/users.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';

const router = Router();

router.get('/', getUsers);

router.get('/:id', param('id'), validationErrorHandler, getUser);

router.get(
  '/:id/viewed-movies',
  param('id'),
  validationErrorHandler,
  getViewedMoviesOfUser,
);

router.get(
  '/:id/reviews',
  param('id'),
  validationErrorHandler,
  getReviewsOfUser,
);

router.get(
  '/:id/thanked-reviews',
  param('id'),
  validationErrorHandler,
  getThankedReviewsOfUser,
);

export default router;
