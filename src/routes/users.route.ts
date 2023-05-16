import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getUser,
  getViewedMoviesOfUser,
  signUp,
  updateUser,
} from '../controllers/users.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import passport from 'passport';

function calcLatestDateOfBirthAllowed() {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 14);
  return currentDate.toDateString();
}

const router = Router();

router.post(
  '/',
  body('username').notEmpty(),
  body('email').isEmail(),
  body('type').toLowerCase().isIn(['regular', 'critic']),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  body('gender').optional().toLowerCase().isIn(['male', 'female', 'other']),
  body('dateOfBirth')
    .optional()
    .isBefore(calcLatestDateOfBirthAllowed())
    .toDate(),
  body('blogUrl')
    .if((value: any, { req }: any) => req.body.type === 'critic')
    .notEmpty(),
  validationErrorHandler,
  signUp,
);

router.get('/:id', param('id').toInt(), validationErrorHandler, getUser);

router.patch(
  '/:id',
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
  body('blogUrl').optional().notEmpty(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  updateUser,
);

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
