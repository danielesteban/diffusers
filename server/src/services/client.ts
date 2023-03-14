import { notFound } from '@hapi/boom';
import { createHash } from 'crypto';
import type { Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import namor from 'namor';
import type { AuthorizedRequest } from '../core/auth';
import { checkValidationResult } from '../core/errorHandler';
import { Client } from '../models';

export const create = (req: AuthorizedRequest, res: Response, next: NextFunction) => (
  Client.create({
    name: namor.generate(),
    key: createHash('md5').update(`${req.user.id}${Date.now()}${namor.generate()}`).digest('hex'),
    origin: 'https://example.com',
    user: req.user.id,
  })
    .then((client) => res.json(client.serialize()))
    .catch(next)
);

export const list = (req: AuthorizedRequest, res: Response, next: NextFunction) => (
  Client.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .then((clients) => res.json(clients.map((client) => client.serialize())))
    .catch(next)
);

export const remove = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req: AuthorizedRequest, res: Response, next: NextFunction) => (
    Client.deleteOne({ _id: req.params.id, user: req.user.id })
      .orFail(notFound())
      .then(() => res.json('OK'))
      .catch(next)
  ),
];

export const update = [
  param('id')
    .isMongoId(),
  body('name')
    .optional()
    .trim()
    .not().isEmpty(),
  body('origin')
    .optional()
    .trim()
    .not().isEmpty(),
  checkValidationResult,
  (req: AuthorizedRequest, res: Response, next: NextFunction) => (
    Client.findOne({ _id: req.params.id, user: req.user.id })
      .orFail(notFound())
      .then((client) => {
        if (req.body.name) {
          client.name = req.body.name;
        }
        if (req.body.origin) {
          client.origin = req.body.origin;
        }
        return client.save();
      })
      .then((client) => res.json(client.serialize()))
      .catch(next)
  ),
];
