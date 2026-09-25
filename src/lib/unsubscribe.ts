const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function unsubscribeToken(secret: string, email: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(email.trim().toLowerCase())));
}

export async function verifyUnsubscribeToken(secret: string, email: string, token: string): Promise<boolean> {
  const expected = await unsubscribeToken(secret, email);
  if (expected.length !== token.length) return false;
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return difference === 0;
}

export async function unsubscribeQuery(secret: string, email: string): Promise<string> {
  const address = email.trim().toLowerCase();
  return `e=${encodeURIComponent(address)}&t=${await unsubscribeToken(secret, address)}`;
}
