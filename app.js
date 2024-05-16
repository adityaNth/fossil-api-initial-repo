import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './api/routes/getStorage';

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// To serve user queries
app.use('/getStorage', userRoutes);

// To Handle 404 Errors
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
// To handle internal server errors 500
app.use((error, req, res) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const port = process.env.DEV_PORT || 3000;
app.listen(port);

export default app;
