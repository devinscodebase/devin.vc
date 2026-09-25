import { describe, expect, test } from 'bun:test';

import { unsubscribeQuery, unsubscribeToken, verifyUnsubscribeToken } from './unsubscribe';

describe('unsubscribe tokens', () => {
  test('a token verifies for its own address', async () => {
    const token = await unsubscribeToken('secret', 'owner@example.com');
    expect(await verifyUnsubscribeToken('secret', 'owner@example.com', token)).toBe(true);
  });

  test('address case and spaces do not change the token', async () => {
    const token = await unsubscribeToken('secret', ' Owner@Example.com ');
    expect(await verifyUnsubscribeToken('secret', 'owner@example.com', token)).toBe(true);
  });

  test('a token fails for another address, another secret, or a tampered value', async () => {
    const token = await unsubscribeToken('secret', 'owner@example.com');
    expect(await verifyUnsubscribeToken('secret', 'other@example.com', token)).toBe(false);
    expect(await verifyUnsubscribeToken('other-secret', 'owner@example.com', token)).toBe(false);
    expect(await verifyUnsubscribeToken('secret', 'owner@example.com', token.slice(0, -1) + 'x')).toBe(false);
    expect(await verifyUnsubscribeToken('secret', 'owner@example.com', '')).toBe(false);
  });

  test('the query carries the encoded address and a url-safe token', async () => {
    const query = await unsubscribeQuery('secret', 'me+test@devin.vc');
    const params = new URLSearchParams(query);
    expect(params.get('e')).toBe('me+test@devin.vc');
    expect(params.get('t')).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await verifyUnsubscribeToken('secret', params.get('e')!, params.get('t')!)).toBe(true);
  });
});
