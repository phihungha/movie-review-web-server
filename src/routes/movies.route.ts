import { Router } from 'express';
import { getMovies } from '../controllers/movies.controller';
import passport from 'passport';

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }), getMovies);

export default router;
