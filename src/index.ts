import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AuthRouter from './routes/auth.route';
import MoviesRouter from './routes/movies.route';
import ReviewsRouter from './routes/reviews.route';
import passport from 'passport';
import jwtStrategy from './passport-strategies/jwt.strategy';
import errorHandler from './middlewares/error-handler.middleware';

dotenv.config();
const serverPort = process.env.SERVER_PORT;

passport.use(jwtStrategy);

const app = express();
app.use(bodyParser.json());

app.use('/auth', AuthRouter);
app.use('/movies', MoviesRouter);
app.use('/reviews', ReviewsRouter);
app.use(errorHandler);

app.listen(serverPort, () => {
  console.log(`Express server is running at http://localhost:${serverPort}`);
});
