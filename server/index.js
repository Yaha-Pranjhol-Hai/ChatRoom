import connectToMongo from './db/db.js';
import dotenv from 'dotenv';
import server from './app.js';

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3001;

connectToMongo()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection failed`, err);
  });
