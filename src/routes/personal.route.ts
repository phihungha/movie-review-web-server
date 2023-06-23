import { Router } from 'express';
import {
  getPersonalThankedReviews,
  getPersonalReviews,
  getPersonalViewedMovies,
} from '../controllers/personal.controller';
import { param, body } from 'express-validator';
import { updatePersonalInfo } from '../controllers/personal.controller';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import { calcDateOfBirthFromAge } from '../utils';
import requireAuth from '../middlewares/require-auth.middleware';

const router = Router();

router.get('/viewed-movies', requireAuth, getPersonalViewedMovies);

router.get('/reviews', requireAuth, getPersonalReviews);

router.get('/thanked-reviews', requireAuth, getPersonalThankedReviews);

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
    .isBefore(calcDateOfBirthFromAge(14).toDateString())
    .toDate(),
  body('blogUrl').optional().isURL(),
  validationErrorHandler,
  requireAuth,
  updatePersonalInfo,
);

export default router;
