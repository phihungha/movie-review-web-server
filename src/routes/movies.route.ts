import { Router } from 'express';
import {
  getMovieDetails,
  getMovies,
  markMovieAsViewed,
} from '../controllers/movies.controller';
import { body, param, query } from 'express-validator';
import validationErrorHandler from '../middlewares/validation-error-handler.middleware';
import {
  deleteReview,
  getReview,
  getReviewsOfMovie,
  postReviewOfMovie,
  thankReview,
  updateReview,
} from '../controllers/reviews.controller';
import passport from 'passport';

const router = Router();

router.get('/', getMovies);

router.get(
  '/:id',
  param('id').toInt(),
  validationErrorHandler,
  getMovieDetails,
);

router.put(
  '/:id/viewed',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  markMovieAsViewed,
);

router.get(
  '/:id/reviews',
  param('id').toInt(),
  query('limit').optional().isInt({ min: 0 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
  query('orderBy').optional().isIn(['thankCount', 'postTime', 'score']),
  query('asc').optional().toBoolean(),
  validationErrorHandler,
  getReviewsOfMovie,
);

router.get(
  '/:movieId/reviews/:id',
  param('id').toInt(),
  validationErrorHandler,
  getReview,
);

router.post(
  '/:id/reviews',
  param('id').toInt(),
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('score').isInt({ min: 0, max: 10 }).toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  postReviewOfMovie,
);

router.patch(
  '/:movieId/reviews/:id',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  updateReview,
);

router.delete(
  '/:movieId/reviews/:id',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  deleteReview,
);

router.put(
  '/:movieId/reviews/:id/thank',
  param('id').toInt(),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  thankReview,
);

export default router;
