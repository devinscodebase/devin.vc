import { createHmac } from 'node:crypto';
import { NEWSLETTER_SECRET } from 'astro:env/server';

export function generateToken(email: string): string {
  return createHmac('sha256', NEWSLETTER_SECRET).update(email.toLowerCase()).digest('hex');
}

export function verifyToken(email: string, token: string): boolean {
  return generateToken(email) === token;
}
