import { badRequest, unauthorized } from '@hapi/boom';
import type { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import type { AuthorizedRequest } from '../core/auth';
import { client, clientOrigin } from '../core/config';
import sendMail from '../core/mail';
import { checkValidationResult } from '../core/errorHandler';
import { User, UserDocument } from '../models';

export const login = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .trim()
    .not().isEmpty(),
  checkValidationResult,
  (req: Request, res: Response, next: NextFunction) => (
    passport.authenticate('local', (err: Error, user: UserDocument) => {
      if (err || !user) {
        next(err || unauthorized());
        return;
      }
      user
        .getSession()
        .then((session) => res.json(session))
        .catch(next);
    })(req, res)
  ),
];

export const loginWithGoogle = (
  passport.authenticate('google', {
    prompt: 'select_account',
    scope: 'email profile',
  })
);

export const recover = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  checkValidationResult,
  (req: Request, res: Response, next: NextFunction) => (
    User.findOne({
      email: req.body.email,
    })
      .orFail(badRequest())
      .then((user) => (
        user.getSession()
          .then(({ session }) => (
            sendMail({
              to: user.email,
              subject: 'Account recovery',
              text: `Visit this link to setup a new password:\n${client}recovery/${session}`,
            })
              .then(() => res.json(true))
          ))
      ))
      .catch(next)
  ),
];

export const refreshSession = (req: AuthorizedRequest, res: Response, next: NextFunction) => (
  req.user.getSession()
    .then((session) => res.json(session))
    .catch(next)
);

export const register = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('name')
    .trim()
    .not().isEmpty(),
  body('password')
    .trim()
    .not().isEmpty(),
  checkValidationResult,
  (req: Request, res: Response, next: NextFunction) => (
    User.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    })
      .then((user) => user.getSession())
      .then((session) => res.json(session))
      .catch((err) => (
        next(err.code === 11000 ? badRequest() : err)
      ))
  ),
];

export const update = [
  body('name')
    .optional()
    .trim()
    .not().isEmpty(),
  body('password')
    .optional()
    .trim()
    .not().isEmpty(),
  checkValidationResult,
  (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.body.name) {
      req.user.name = req.body.name;
    }
    if (req.body.password) {
      req.user.password = req.body.password;
    }
    req.user
      .save()
      .then((user) => user.getSession())
      .then((session) => res.json(session))
      .catch(next);
  },
];

export const verifyGoogleLogin = (req: Request, res: Response) => (
  passport.authenticate('google', (err: Error, user: UserDocument) => {
    ((err || !user) ? Promise.resolve() : user.getSession())
      .then((session) => (
        res.send(
          '<script>'
          + 'window.addEventListener("message",({origin,source})=>{'
          + `if(origin===${JSON.stringify(clientOrigin)}){`
          + `source.postMessage({${(
            (!session) ? (
              'err:1'
            ) : (
              `user:${JSON.stringify(session)}`
            )
          )}},origin);`
          + 'window.close()'
          + '}'
          + '},false)'
          + '</script>'
        )
      ));
  })(req, res)
);
