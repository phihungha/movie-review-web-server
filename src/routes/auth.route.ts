import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/auth.controller';
import { validationErrorHandler } from '../middlewares/validation-response.middleware';

const router = Router();

router.post(
  '/',
  body('username').notEmpty(),
  body('password').notEmpty(),
  validationErrorHandler,
  login,
);

export default router;
