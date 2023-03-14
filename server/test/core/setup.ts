import mongoose from 'mongoose';
import { dropDatabase, mongoURI } from './config';

export default async () => {
  if (dropDatabase) {
    await mongoose.connect(mongoURI);
    await mongoose.connection.dropDatabase();
    await Promise.all(mongoose.modelNames().map((model) => mongoose.model(model).ensureIndexes()));
    await mongoose.connection.close();
  }
};
