import mongoose from 'mongoose';
import app from './core/app';
import { mongoURI, port } from './core/config';

mongoose.connect(mongoURI);

const server = app.listen(port);

const shutdown = () => (
  server.close(() => (
    mongoose.connection.close()
      .then(() => (
        process.nextTick(() => process.exit(0))
      ))
  ))
);

process
  .on('SIGTERM', shutdown)
  .on('SIGINT', shutdown);
