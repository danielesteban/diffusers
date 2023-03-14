import { unauthorized } from '@hapi/boom';
import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { googleAuth } from './config';
import { User, UserDocument } from '../models';

export type AuthorizedRequest = Request & { user: UserDocument; };
type AuthorizedRequestHandler = (req: AuthorizedRequest, res: Response, next: NextFunction) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

export const requireAuth = (handlers: AuthorizedRequestHandler | AuthorizedRequestHandler[]) => [
  (req: Request, _res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization) {
      const [type, value] = req.headers.authorization.split(' ');
      if (type === 'Bearer') {
        token = value;
      }
    }
    if (!token) {
      throw unauthorized();
    }
    User
      .fromToken(token)
      .then((user) => {
        (req as AuthorizedRequest).user = user;
        next();
      })
      .catch((err) => next(unauthorized(err)))
  },
  ...((Array.isArray(handlers) ? handlers : [handlers]) as RequestHandler[])
];

export const setupPassport = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  }, (email: string, password: string, done: VerifyCallback) => (
    User
      .findOne({ email, password: { $exists: true } })
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        return user
          .comparePassword(password)
          .then((isMatch) => {
            if (!isMatch) {
              done(null, false);
              return;
            }
            done(null, user);
          });
      })
      .catch(done)
  )));

  if (
    !googleAuth.clientID || !googleAuth.clientSecret
  ) {
    return;
  }
  passport.use(new GoogleStrategy(googleAuth, (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
    const {
      displayName: name,
      emails,
    } = profile;
    const [email] = (emails || []).map(({ value }: { value: string; }) => (value));
    if (!email || !name) {
      done(new Error());
      return;
    }
    User
      .findOrCreate({ email }, { email, name })
      .then((user) => done(null, user))
      .catch(done);
  }));
};
