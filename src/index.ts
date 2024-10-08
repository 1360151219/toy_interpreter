/* eslint-disable import/no-unresolved */
import * as acorn from 'acorn';
import Interpreter from './run.js';
const Options: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  locations: true,
};

function main(code: string, sandbox?: Record<string, any>) {
  const interpreter = new Interpreter();
  const ast = acorn.parse(code, Options);
  return interpreter.run(ast, sandbox);
}

export default main;
main('console.log(a);var a = 1;');
// main(
//   `function foo(){
//   let a = 1;
//   return a;
//   }
//   let a = foo();
//   console.log(a)`,
//   {}
// );
