import mongoose from 'mongoose';
import { app, mongoURI } from './config';

afterAll(() => mongoose.connection.close());
beforeAll(() => mongoose.connect(mongoURI));

export default app;
