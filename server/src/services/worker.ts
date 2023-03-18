import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import protobuf from 'protobufjs';
import { v4 as uuid } from 'uuid';
import type * as ws from 'ws';
import { Job as Log } from '../models';

const Messages = protobuf.loadSync('dist/messages.proto');
const Config = Messages.lookupType('Config');
const Job = Messages.lookupType('Job');
const Version = Messages.getOption('(protocol_version)');

type Worker = ws & { id: string; isAlive: boolean; pipelines: Record<string, boolean>; };
const workers: Worker[] = [];

let pingInterval: NodeJS.Timer | undefined;
const ping = () => (
  workers.forEach((worker) => {
    if (worker.isAlive === false) {
      worker.terminate();
      return;
    }
    worker.isAlive = false;
    worker.ping(() => {});
  })
);

export const connect = (ws: ws) => {
  const worker: Worker = ws as any;
  worker.id = uuid();
  worker.isAlive = true;
  worker.once('close', () => {
    const index = workers.findIndex(({ id }) => (id === worker.id));
    if (index !== -1) {
      workers.splice(index, 1);
    }
    if (pingInterval && !workers.length) {
      clearInterval(pingInterval);
      pingInterval = undefined;
    }
  });
  worker.once('message', (buffer: Buffer) => {
    let config;
    try {
      config = Config.decode(buffer) as any;
    } catch (e) {
      config = {};
    }
    if (config.version !== Version) {
      worker.send(`v${config.version || 'unknown'} is out of date. Please update to v${Version}.`);
      worker.close();
      return;
    }
    worker.pipelines = config.pipelines;
    workers.push(worker);
    worker.send('OK');
    if (!pingInterval) {
      pingInterval = setInterval(ping, 30000);
    }
  });
  worker.on('pong', () => {
    worker.isAlive = true;
  });
};

export const job = (pipeline: string) => [
  (req: Request, res: Response, next: NextFunction) => {
    const worker = workers.findIndex(({ pipelines }) => pipelines[pipeline]);
    if (worker === -1) {
      res.status(503).end();
      return;
    }
    (req as any).worker = workers.splice(worker, 1)[0];
    next();
  },
  multer({ storage: multer.memoryStorage(), limits: { fileSize: 1048576 } }).single('image'),
  (req: Request, res: Response) => {
    const client: string | undefined = (req as any).client;
    const worker: Worker = (req as any).worker;
    const payload: any = {
      image: req.file && req.file.buffer,
    };
    if (pipeline === 'diffusion') {
      payload.max_threshold = Math.min(Math.max(parseInt(req.body.max_threshold, 10) || 255, 0), 255);
      payload.min_threshold = Math.min(Math.max(parseInt(req.body.min_threshold, 10) || 85, 0), 255);
      payload.negative_prompt = (req.body.negative_prompt || '').trim();
      payload.prompt = (req.body.prompt || '').trim();
      payload.steps = Math.min(Math.max(parseInt(req.body.steps, 10) || 30, 1), 100);
      payload.strength = Math.min(Math.max(parseFloat(req.body.strength) || 1, 0), 1);
    }
    if (!payload.image || (pipeline === 'diffusion' && !payload.prompt)) {
      workers.push(worker);
      res.status(400).end();
      return;
    }
    Log.create({ client, pipeline }).catch(() => {});
    const onError = () => (
      res.status(503).end()
    );
    worker.once('close', onError);
    worker.once('message', (result: Buffer) => {
      worker.off('close', onError);
      workers.push(worker);
      res
        .set('Content-Type', 'image/png')
        .send(result);
    });
    worker.send(Job.encode(Job.create({ [pipeline]: payload })).finish());
  },
];

export const list = (_req: Request, res: Response) => (
  res.json(workers.reduce((pipelines: Record<string, number>, worker) => {
    Object.keys(pipelines).forEach((pipeline) => {
      if (worker.pipelines[pipeline]) {
        pipelines[pipeline]++;
      }
    });
    return pipelines;
  }, { depth: 0, diffusion: 0, upscale: 0 }))
);

export const stats = (_req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const fourWeeksAgo = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 28
  ));
  Log.aggregate()
    .match({ createdAt: { $gt: fourWeeksAgo } })
    .group({
      _id: { date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } }, pipeline: '$pipeline' },
      count: { $sum: 1 },
    })
    .then((results) => (
      res.json(
        results.reduce((results, { _id: { date, pipeline }, count }) => {
          if (!results[date]) {
            results[date] = [0, 0, 0];
          }
          results[date][['depth', 'diffusion', 'upscale'].indexOf(pipeline)] = count;
          return results;
        }, {})
      )
    ))
    .catch(next);
};
