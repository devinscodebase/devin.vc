import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend() {
  if (!_resend) {
    _resend = new Resend(import.meta.env.RESEND_API_KEY);
  }
  return _resend;
}

export const SENDER = 'Devin Alexander <me@send.devin.vc>';
