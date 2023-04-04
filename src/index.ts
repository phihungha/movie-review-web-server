import express from "express";
import dotenv from "dotenv";

dotenv.config();
const serverPort = process.env.SERVER_PORT;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(serverPort, () => {
  console.log(`Express server is running at http://localhost:${serverPort}`);
});
