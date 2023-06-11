import { Router } from 'express';
import passport from 'passport';
import {
  getThankedReviewsOfCurrentUser,
  getReviewsOfCurrentUser,
  getViewedMoviesOfCurrentUser,
} from '../controllers/personal.controller';
import { param, body } from 'express-validator';
import { updatePersonalInfo } from '../controllers/personal.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import { calcLatestDateOfBirthAllowed } from '../utils';

const router = Router();

router.get(
  '/viewed-movies',
  passport.authenticate('jwt', { session: false }),
  getViewedMoviesOfCurrentUser,
);

router.get(
  '/reviews',
  passport.authenticate('jwt', { session: false }),
  getReviewsOfCurrentUser,
);

router.get(
  '/thanked-reviews',
  passport.authenticate('jwt', { session: false }),
  getThankedReviewsOfCurrentUser,
);

router.patch(
  '/',
  param('id').toInt(),
  body('username').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 8 }),
  body('name').optional().notEmpty(),
  body('gender').optional().toLowerCase().isIn(['male', 'female', 'other']),
  body('dateOfBirth')
    .optional()
    .isBefore(calcLatestDateOfBirthAllowed())
    .toDate(),
  body('blogUrl').optional().isURL(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  updatePersonalInfo,
);

export default router;
