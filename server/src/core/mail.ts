// @ts-ignore
import gmail from 'gmail-send';
import { gmailAuth } from './config';

export default gmail({
  user: gmailAuth.user,
  pass: gmailAuth.pass,
}) as (options: { to: string; subject: string; text: string; }) => Promise<void>;
