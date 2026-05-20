import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import apiRoutes from './routes/index.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(apiLimiter);

app.get('/', (_req, res) => {
  res.status(200).send('API is running 🚀');
});

app.use('/api', apiRoutes);

app.use(errorMiddleware);

export default app;
