// sum.test.js
import { expect, test } from 'vitest';
import interpreter from '../src/index';
const useTest = () => {
  const obj = {};
  const testReturn = (res) => {
    obj.result = res;
  };
  return { obj, testReturn };
};

test('declare variable "a" equal to 1', () => {
  const { obj, testReturn } = useTest();
  const code = 'let a = 1;testReturn(a);';
  interpreter(code, { testReturn });
  expect(obj.result).toBe(1);
});
