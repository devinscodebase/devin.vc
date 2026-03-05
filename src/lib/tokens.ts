import { createHmac } from 'node:crypto';

const secret = import.meta.env.NEWSLETTER_SECRET;

export function generateToken(email: string): string {
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}

export function verifyToken(email: string, token: string): boolean {
  return generateToken(email) === token;
}
