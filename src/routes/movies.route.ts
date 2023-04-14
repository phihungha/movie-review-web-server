import { Router } from 'express';
import { getMovieDetails, getMovies } from '../controllers/movies.controller';
import { body, param, query } from 'express-validator';
import validationErrorHandler from '../middlewares/validation-response.middleware';
import {
  getReviewsOfMovie,
  postReviewOfMovie,
} from '../controllers/reviews.controller';
import passport from 'passport';

const router = Router();

router.get('/', getMovies);
router.get(
  '/:id',
  param('id').isInt(),
  validationErrorHandler,
  getMovieDetails,
);
router.get(
  '/:id/reviews',
  param('id').isInt(),
  query('limit').optional().isInt({ min: 0 }),
  query('skip').optional().isInt({ min: 0 }),
  query('orderBy').optional().isIn(['thankCount', 'postTime', 'score']),
  query('asc').optional().isBoolean(),
  validationErrorHandler,
  getReviewsOfMovie,
);
router.post(
  '/:id/reviews',
  param('id').isInt(),
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('score').isInt({ min: 0, max: 10 }),
  validationErrorHandler,
  passport.authenticate('jwt', { session: false }),
  postReviewOfMovie,
);

export default router;
