import { createHmac } from 'node:crypto';

export function generateToken(email: string): string {
  const secret = import.meta.env.NEWSLETTER_SECRET;
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}

export function verifyToken(email: string, token: string): boolean {
  return generateToken(email) === token;
}
