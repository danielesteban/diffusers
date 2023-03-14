import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { model, FilterQuery, HydratedDocument, Model, Schema } from 'mongoose';
import { sessionSecret } from '../core/config';

interface User {
  email: string;
  name: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSession(): Promise<{ name: string; session: string; }>;
}

export type UserDocument = HydratedDocument<User, UserMethods>;

interface UserModel extends Model<User, {}, UserMethods> {
  findOrCreate(selector: FilterQuery<{ email: string; }>, data: { email: string; name: string; }): Promise<UserDocument>;
  fromToken(token: string): Promise<UserDocument>;
}

const UserSchema = new Schema<User, UserModel, UserMethods>({
  email: {
    type: String,
    lowercase: true,
    required: true,
    index: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: String,
}, { timestamps: true });

UserSchema.pre('save', function onSave(next) {
  const user = this;
  if (user.isModified('password') && user.password) {
    return bcrypt.genSalt(5, (err, salt) => {
      if (err) {
        return next(err);
      }
      return bcrypt.hash(user.password!, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        return next();
      });
    });
  }
  return next();
});

UserSchema.methods = {
  comparePassword(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => (
      bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(isMatch);
      })
    ));
  },
  getSession() {
    const user = this;
    return new Promise((resolve, reject) => (
      jwt.sign({ id: user.id }, sessionSecret, { expiresIn: '24h' }, (err, session) => {
        if (err || !session) {
          reject(err);
          return;
        }
        resolve({
          name: user.name,
          session,
        });
      })
    ));
  },
};

UserSchema.statics = {
  findOrCreate(selector: FilterQuery<{ email: string; }>, data: { email: string; name: string; }) {
    const User = this;
    return User
      .findOne(selector)
      .then((user) => {
        if (user) {
          return user;
        }
        user = new User(data);
        return user.save();
      });
  },
  fromToken(token) {
    const User = this;
    return new Promise((resolve, reject) => (
      jwt.verify(token, sessionSecret, (err: Error | null, decoded: any) => {
        if (err || !decoded.id) {
          reject(err);
          return;
        }
        resolve(
          User.findById(decoded.id).orFail()
        );
      })
    ));
  },
};

export default model<User, UserModel>('User', UserSchema);
