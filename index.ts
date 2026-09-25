import express from 'express';
import { rateLimit } from './rateLimit.ts';
import weatherRouter from './weather.ts';

const app = express();

app.use(rateLimit);

app.use('/weather', weatherRouter);

app.listen(3000, () => console.log('App running on port 3000'));
