import { Router } from 'express';
import { getMovieDetails, getMovies } from '../controllers/movies.controller';
import { param } from 'express-validator';
import validationErrorHandler from '../middlewares/validation-response.middleware';

const router = Router();

router.get('/', getMovies);
router.get(
  '/:id',
  param('id').isNumeric(),
  validationErrorHandler,
  getMovieDetails,
);

export default router;
