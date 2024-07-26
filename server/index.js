import connectToMongo from './db/index.js';
import  dotenv from "dotenv";
import app from './app.js';

dotenv.config({
  path: "./.env",
});

connectToMongo()
.then(() => {
  app.listen(process.env.PORT || 3002);
})
.catch((err) => {
  console.log(`Mongo db connection failed`, err);
});

