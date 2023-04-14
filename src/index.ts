import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AuthRouter from './routes/auth.route';
import MovieRouter from './routes/movies.route';
import passport from 'passport';
import jwtStrategy from './passport-strategies/jwt.strategy';

dotenv.config();
const serverPort = process.env.SERVER_PORT;

const app = express();
app.use(bodyParser.json());

passport.use(jwtStrategy);

app.use('/auth', AuthRouter);
app.use('/movies', MovieRouter);

app.listen(serverPort, () => {
  console.log(`Express server is running at http://localhost:${serverPort}`);
});
