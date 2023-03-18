import type { Application } from 'express-ws';
import nocache from 'nocache';
import { requireAuth } from '../core/auth';
import * as client from './client';
import * as user from './user';
import * as worker from './worker';

const preventCache = nocache();

export default (app: Application) => {
  app.get(
    '/clients',
    preventCache,
    requireAuth(client.list)
  );

  app.post(
    '/client',
    preventCache,
    requireAuth(client.create)
  );

  app.delete(
    '/client/:id',
    preventCache,
    requireAuth(client.remove)
  );

  app.put(
    '/client/:id',
    preventCache,
    requireAuth(client.update)
  );

  app.get(
    '/user',
    preventCache,
    requireAuth(user.refreshSession)
  );

  app.put(
    '/user',
    preventCache,
    user.login
  );

  app.patch(
    '/user',
    preventCache,
    requireAuth(user.update)
  );

  app.post(
    '/user',
    preventCache,
    user.register
  );

  app.get(
    '/user/google',
    preventCache,
    user.loginWithGoogle
  );

  app.get(
    '/user/google/auth',
    preventCache,
    user.verifyGoogleLogin
  );

  app.post(
    '/user/recover',
    preventCache,
    user.recover
  );

  app.ws(
    '/worker',
    worker.connect,
  );

  app.get(
    '/workers',
    preventCache,
    worker.list
  );

  app.get(
    '/jobs',
    preventCache,
    worker.stats
  );

  app.post(
    `/depth`,
    preventCache,
    worker.job('depth')
  );
  
  app.post(
    `/diffusion`,
    preventCache,
    worker.job('diffusion')
  );

  app.post(
    `/upscale`,
    preventCache,
    worker.job('upscale')
  );
};
