import request from 'supertest';
import server from '../../src/core/app';

export const app = request(server);
export const dropDatabase = !!process.env.DROP_DATABASE;
export { mongoURI } from '../../src/core/config';
