import { Request, Router } from 'express';
import { body, param } from 'express-validator';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getUser,
  getViewedMoviesOfUser,
  signUp,
  getUsers,
} from '../controllers/users.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import requireNewUserAuth from '../middlewares/require-new-user-auth.middleware';

function calcLatestDateOfBirthAllowed() {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 14);
  return currentDate.toDateString();
}

const router = Router();

router.get('/', getUsers);

router.post(
  '/',
  body('username').notEmpty(),
  body('type').toLowerCase().isIn(['regular', 'critic']),
  body('gender').optional().toLowerCase().isIn(['male', 'female', 'other']),
  body('dateOfBirth')
    .optional()
    .isBefore(calcLatestDateOfBirthAllowed())
    .toDate(),
  body('blogUrl')
    .if(
      (_: unknown, { req }: { req: unknown }) =>
        (req as Request).body.type === 'critic',
    )
    .isURL(),
  validationErrorHandler,
  requireNewUserAuth,
  signUp,
);

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
