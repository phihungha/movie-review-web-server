import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AuthRouter from './routes/auth.route';

dotenv.config();
const serverPort = process.env.SERVER_PORT;

const app = express();

app.use(bodyParser.json());

app.use('/auth', AuthRouter);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(serverPort, () => {
  console.log(`Express server is running at http://localhost:${serverPort}`);
});
