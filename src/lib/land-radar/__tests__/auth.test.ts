import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  authenticateWithPassword,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  USER_COOKIE_NAME,
} from '../../auth/session';

describe('Land Radar Authentication & Session Handling', () => {
  it('defines the standard cookie identifiers', () => {
    assert.strictEqual(AUTH_COOKIE_NAME, 'sb-access-token');
    assert.strictEqual(REFRESH_COOKIE_NAME, 'sb-refresh-token');
    assert.strictEqual(USER_COOKIE_NAME, 'euk-auth-user');
  });

  it('authenticates authorized analyst credentials successfully in dev/test environment', async () => {
    const result = await authenticateWithPassword('analyst@entire-uk.com', 'EntireUK2026!');
    assert.strictEqual(result.error, undefined);
    assert.ok(result.session);
    assert.ok(result.session.accessToken.startsWith('dev-token-'));
    assert.strictEqual(result.session.user.email, 'analyst@entire-uk.com');
    assert.strictEqual(result.session.user.role, 'analyst');
  });

  it('rejects invalid analyst credentials', async () => {
    const result = await authenticateWithPassword('analyst@entire-uk.com', 'WrongPassword123');
    assert.ok(result.error);
    assert.strictEqual(result.session, undefined);
  });

  it('rejects unknown email addresses', async () => {
    const result = await authenticateWithPassword('stranger@example.com', 'EntireUK2026!');
    assert.ok(result.error);
    assert.strictEqual(result.session, undefined);
  });
});
