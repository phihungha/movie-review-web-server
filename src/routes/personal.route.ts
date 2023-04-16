import { Router } from 'express';
import passport from 'passport';
import {
  getThankedReviewsOfCurrentUser,
  getReviewsOfCurrentUser,
  getViewedMoviesOfCurrentUser,
} from '../controllers/personal.controller';

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

export default router;
