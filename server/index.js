import connectToMongo from './db/index.js';
import dotenv from 'dotenv';
import app from './app.js'; // Import the app without starting the server

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3002;

connectToMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection failed`, err);
  });
