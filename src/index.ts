import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import MoviesRouter from './routes/movies.route';
import ReviewsRouter from './routes/reviews.route';
import UsersRouter from './routes/users.route';
import PersonalRouter from './routes/personal.route';
import errorHandler from './middlewares/error-handler.middleware';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import addIdentity from './middlewares/add-identity.middleware';
import cors from 'cors';

dotenv.config();

initializeApp({ credential: applicationDefault() });

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(addIdentity);

app.use('/movies', MoviesRouter);
app.use('/reviews', ReviewsRouter);
app.use('/users', UsersRouter);
app.use('/personal', PersonalRouter);
app.use(errorHandler);

const serverPort = process.env.SERVER_PORT;
app.listen(serverPort, () => {
  console.log(`Server is listening on http://localhost:${serverPort}`);
});
