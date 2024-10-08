// sum.test.js
import { expect, test } from 'vitest';
import interpreter from '../src/index';

test('declare variable "a" equal to 1 with export defualt', () => {
  const code = 'let a = 1; export default a;';
  const module = interpreter(code);
  expect(module.defaultExports).toBe(1);
});

test('declare variable "a" equal to 1 with export', () => {
  const code = 'export const a = 1,b = 2; export const c = 3;';
  const module = interpreter(code);
  expect(module.exports.a).toBe(1);
  expect(module.exports.b).toBe(2);
  expect(module.exports.c).toBe(3);
});
