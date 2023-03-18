import { unauthorized } from '@hapi/boom';
import cors from 'cors';
import type { Application, Request } from 'express';
import { corsWhitelist } from './config';
import { Client } from '../models';

export default (app: Application) => (
  app.use(cors((req: Request, next) => {
    const client = (req as any).query.client;
    const origin = (req as any).headers.origin;
    (origin === undefined || corsWhitelist.includes(origin) ? (
      Promise.resolve()
    ) : (
      client ? Client.findOne({ key: client }).select('origin').lean().orFail().then((client) => {
        if (client.origin !== origin) {
          throw new Error();
        }
        (req as any).client = client._id.toHexString();
      }) : Promise.reject()
    ))
      .then(() => next(null, { origin: true }))
      .catch(() => next(unauthorized()));
  }))
);
