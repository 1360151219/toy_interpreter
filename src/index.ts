/* eslint-disable import/no-unresolved */
import * as acorn from 'acorn';
import Interpreter from './run.js';
const Options: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'script',
  locations: true,
};

function main(code: string, _sandbox: any) {
  const ast = acorn.parse(code, Options);
  Interpreter.run(ast);
}

main('let a = 1;', {});
