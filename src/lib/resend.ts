import { Resend } from 'resend';
import { RESEND_API_KEY } from 'astro:env/server';

let _resend: Resend | null = null;

export function getResend() {
  if (!_resend) {
    _resend = new Resend(RESEND_API_KEY);
  }
  return _resend;
}

export const SENDER = 'Devin Alexander <me@send.devin.vc>';
