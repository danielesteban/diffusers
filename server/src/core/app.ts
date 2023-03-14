import express from 'express';
import expressWS, { Application } from 'express-ws';
import helmet from 'helmet';
import { setupPassport } from './auth';
import setupCors from './cors';
import { setup as setupErrorHandler } from './errorHandler';
import setupServices from '../services';

const app = express() as any as Application;
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
}));
setupCors(app);
expressWS(app, undefined, { wsOptions: { clientTracking: false } });
app.use(express.json());
setupPassport();
setupServices(app);
setupErrorHandler(app);

export default app;
