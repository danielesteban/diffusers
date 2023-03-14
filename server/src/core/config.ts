import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
mongoose.set('strictQuery', true);

export const client = process.env.CLIENT_URL || 'http://localhost:8080/';
export const clientOrigin = (new URL(client)).origin;
export const corsWhitelist: string[] = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : [clientOrigin];
export const development = process.env.NODE_ENV === 'development';
export const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1/diffusers';
export const port = process.env.PORT || 8081;
export const sessionSecret = process.env.SESSION_SECRET || 'superunsecuresecret';

export const gmailAuth = {
  user: process.env.GMAIL_USER as string,
  pass: process.env.GMAIL_PASS as string,
};

export const googleAuth =  {
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: process.env.GOOGLE_AUTH_CALLBACK || 'http://localhost:8081/user/google/auth',
};

if (
  !gmailAuth.user
  || !gmailAuth.pass
) {
  console.log('\nWarning:\nYou must provide both GMAIL_USER and GMAIL_PASS.\n');
}

if (
  !googleAuth.clientID
  || !googleAuth.clientSecret
) {
  console.log('\nWarning:\nYou must provide both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.\n');
}

if (
  sessionSecret === 'superunsecuresecret'
  && process.env.NODE_ENV === 'production'
) {
  console.warn('\nSecurity warning:\nYou must provide a random SESSION_SECRET.\n');
}
