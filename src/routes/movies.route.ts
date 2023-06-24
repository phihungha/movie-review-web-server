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
  getReviewBreakdown,
  getReviewsOfMovie,
  postReviewOfMovie,
  thankReview,
  updateReview,
} from '../controllers/reviews.controller';
import requireAuth from '../middlewares/require-auth.middleware';

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
  requireAuth,
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
  '/:id/reviewBreakdown',
  param('id').toInt(),
  validationErrorHandler,
  getReviewBreakdown,
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
  requireAuth,
  postReviewOfMovie,
);

router.patch(
  '/:movieId/reviews/:id',
  param('id').toInt(),
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('score').isInt({ min: 0, max: 10 }).toInt(),
  validationErrorHandler,
  requireAuth,
  updateReview,
);

router.delete(
  '/:movieId/reviews/:id',
  param('id').toInt(),
  validationErrorHandler,
  requireAuth,
  deleteReview,
);

router.put(
  '/:movieId/reviews/:id/thanks',
  param('id').toInt(),
  validationErrorHandler,
  requireAuth,
  thankReview,
);

export default router;
