const test = require('node:test');
const assert = require('node:assert');
const { isValidEmail, isStrongPassword } = require('../src/utils/validators');

test('valid and invalid emails', () => {
  assert.strictEqual(isValidEmail('nishant@example.com'), true);
  assert.strictEqual(isValidEmail('not-an-email'), false);
});

test('password strength rules', () => {
  assert.strictEqual(isStrongPassword('abc12345'), true);
  assert.strictEqual(isStrongPassword('short1'), false);
  assert.strictEqual(isStrongPassword('onlyletters'), false);
});
