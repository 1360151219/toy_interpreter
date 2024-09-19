/* eslint-disable import/no-unresolved */
import * as acorn from 'acorn';
import Interpreter from './run.js';
const Options: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'script',
  locations: true,
};

function main(code: string, sandbox?: Record<string, any>) {
  const ast = acorn.parse(code, Options);
  Interpreter.run(ast, sandbox);
}

export default main;
main('let a = 1;console.log(a);');
// main(
//   `function foo(){
//   let a = 1;
//   return a;
//   }
//   let a = foo();
//   console.log(a)`,
//   {}
// );
