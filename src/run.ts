/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import { Identifier, Literal, Node, Program, VariableDeclaration, VariableDeclarator } from 'acorn';
import { Scope } from './Scope.js';

class Interpreter {
  scope: Scope;
  constructor() {
    this.scope = new Scope('block');
  }

  Program(node: Program) {
    const { body } = node;
    body.forEach((ele) => {
      this?.[ele.type]?.(ele);
    });
  }
  Literal(node: Literal) {
    return node.value;
  }
  Identifier(node: Identifier) {
    const { name } = node;
    const variable = this.scope.find(name);
    if (variable) return variable;
    throw SyntaxError('变量还没被声明');
  }
  VariableDeclarator(_node: VariableDeclarator) {}
  VariableDeclaration(node: VariableDeclaration) {
    const { declarations, kind } = node;
    declarations.forEach((declaration) => {
      const { id } = declaration;
      const { name } = id;
      const init = this._excute(declaration?.init, declaration.init?.type);
      this.scope[kind](name, init);
      console.log(this.scope);

      // this._excute(declaration, declaration.type);
    });
  }
  _excute(node?: Node | null, type?: string) {
    if (!node || !type) return;
    return this[type]?.(node);
  }
  run(ast: Program) {
    return this._excute(ast, ast.type);
  }
}

export default new Interpreter();
