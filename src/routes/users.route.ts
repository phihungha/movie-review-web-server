import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getUser,
  getViewedMoviesOfUser,
  signUp,
} from '../controllers/users.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';

function getLatestBirthdateAllowed() {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 14);
  return currentDate.toDateString();
}

const router = Router();

router.post(
  '/',
  body('username').notEmpty(),
  body('email').isEmail(),
  body('type').isIn(['Regular', 'Critic']),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  body('gender').optional().toLowerCase().isIn(['male', 'female', 'other']),
  body('dateOfBirth').optional().isBefore(getLatestBirthdateAllowed()).toDate(),
  body('blogUrl')
    .if((value: any, { req }: any) => req.body.type === 'Critic')
    .notEmpty(),
  validationErrorHandler,
  signUp,
);

router.get('/:id', param('id').toInt(), validationErrorHandler, getUser);

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
