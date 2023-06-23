import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import MoviesRouter from './routes/movies.route';
import ReviewsRouter from './routes/reviews.route';
import UsersRouter from './routes/users.route';
import PersonalRouter from './routes/personal.route';
import errorHandler from './middlewares/error-handler.middleware';

dotenv.config();
const serverPort = process.env.SERVER_PORT;

const app = express();
app.use(bodyParser.json());

app.use('/movies', MoviesRouter);
app.use('/reviews', ReviewsRouter);
app.use('/users', UsersRouter);
app.use('/personal', PersonalRouter);
app.use(errorHandler);

app.listen(serverPort, () => {
  console.log(`Express server is running at http://localhost:${serverPort}`);
});
