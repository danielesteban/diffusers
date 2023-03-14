import { badData, boomify, Boom } from '@hapi/boom';
import type { Application, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { development } from './config';

export const checkValidationResult = (req: Request, _res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const [{ location, param, msg }] = result.array({ onlyFirstError: true });
    throw badData(`${location}[${param}]: ${msg}`);
  }
  next();
};

export const setup = (app: Application) => {
  app.get('*', (_req: Request, res: Response) => res.status(404).end());
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (!(err as any).isBoom) {
      err = boomify(err);
    }
    const { output } = err as Boom;
    res.status(output.statusCode).end();
    if (development && output.statusCode === 500) {
      console.error(err);
    }
  });
};
