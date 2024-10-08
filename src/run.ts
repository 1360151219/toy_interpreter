/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import {
  BlockStatement,
  CallExpression,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  Literal,
  MemberExpression,
  ModuleDeclaration,
  Node,
  Program,
  ReturnStatement,
  Statement,
  VariableDeclaration,
  VariableDeclarator,
} from 'acorn';
import { Scope, Var } from './Scope.js';

const WindowVarMap: { [key: string]: any } = {
  console,
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  encodeURI,
  encodeURIComponent,
  decodeURI,
  decodeURIComponent,
  escape,
  unescape,
  Infinity,
  NaN,
  isFinite,
  isNaN,
  parseFloat,
  parseInt,
  Object,
  Boolean,
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  Number,
  Math,
  Date,
  String,
  RegExp,
  Array,
  JSON,
  Promise,
};

class Module {
  defaultExports: Record<string, any>;
  exports: Record<string, any>;
  name: string;
  constructor() {
    this.exports = {};
    this.defaultExports = {};
    this.name = String(Date.now());
  }
}

class Interpreter {
  scope: Scope;
  module: Module;
  constructor() {
    this.scope = new Scope('block');
    this.module = new Module();
    for (const name of Object.getOwnPropertyNames(WindowVarMap)) {
      this.scope.const(name, WindowVarMap[name]);
    }
  }

  Program(node: Program, scope: Scope) {
    const { body } = node;
    body.forEach((ele) => {
      this?.[ele.type]?.(ele, scope);
    });
  }
  BlockStatement(node: BlockStatement, scope: Scope) {
    for (const body of node.body) {
      const result = this._excute(body, scope);
      if (body.type === 'ReturnStatement') {
        return result;
      }
    }
  }
  ExpressionStatement(node: ExpressionStatement, scope: Scope) {
    this._excute(node.expression, scope);
  }
  ReturnStatement(node: ReturnStatement, scope: Scope) {
    return this._excute(node.argument, scope);
  }
  // 字符
  Literal(node: Literal, scope: Scope) {
    return node.value;
  }
  // 变量
  Identifier(node: Identifier, scope: Scope) {
    const { name } = node;
    const variable = scope.find(name);
    if (variable) return variable.get();
    throw SyntaxError(`变量 ${name} 还没被声明`);
  }

  // 声明语句
  VariableDeclarator(_node: VariableDeclarator, scope: Scope) {}
  VariableDeclaration(node: VariableDeclaration, scope: Scope) {
    const { declarations, kind } = node;

    /**
     * 给导出语句使用
     * @example
     * export const a=1,b=2;
     */
    const resultForExportNamed: Record<string, any> = {};
    declarations.forEach((declaration) => {
      const { id } = declaration;
      const { name } = id;
      const init = this._excute(declaration?.init, scope);
      scope[kind](name, init);
      resultForExportNamed[name] = init;
    });
    return resultForExportNamed;
  }
  // 声明语句--函数声明
  FunctionDeclaration(node: FunctionDeclaration, scope: Scope) {
    const { params } = node;
    const id = node.id.name;
    const subScope = new Scope('function', scope);

    const fun = (...args) => {
      const body = this._excute(node.body, subScope);
      return body;
    };
    scope.var(id, fun);
  }
  // 导出语句
  ExportDefaultDeclaration(node: ExportDefaultDeclaration, scope: Scope) {
    this.module.defaultExports = this._excute(node.declaration, scope);
  }
  ExportNamedDeclaration(node: ExportNamedDeclaration, scope: Scope) {
    const exportNamedObject = this._excute(node.declaration, scope);
    for (const name of Object.getOwnPropertyNames(exportNamedObject)) {
      this.module.exports[name] = exportNamedObject[name];
    }
  }
  // 调用语句
  CallExpression(node: CallExpression, scope: Scope) {
    const callee = this._excute(node.callee, scope);
    const myArguments = node.arguments.map((arg) => {
      return this._excute(arg, scope);
    });
    return callee(...myArguments);
  }
  MemberExpression(node: MemberExpression, scope: Scope) {
    const object = this._excute(node.object, scope);
    // 看下是不是变量
    if (node.computed) {
      const property = this._excute(node.property, scope);
      return object[property];
    } else {
      return object[node.property?.name];
    }
  }
  // 预编译，实现声明提升 FunctionDeclaration、VariableDeclaration
  _preExcute(node: Program, scope: Scope) {
    function traverse(ele: Statement | ModuleDeclaration) {
      const PRE_EXCUTE_NODE_LIST = ['FunctionDeclaration', 'VariableDeclaration', 'BlockStatement'];
      const { type } = ele;
      switch (type) {
        case 'VariableDeclaration': {
          const { declarations, kind } = ele;
          if (kind === 'var') {
            declarations.forEach((declaration) => {
              // TODO
              const { name } = declaration.id;
              scope[kind](name, undefined);
            });
          }
          break;
        }
        default:
          break;
      }
    }

    if (node) {
      for (const ele of node.body) {
        traverse(ele);
      }
    }
  }
  _excute(node: (Node & { type: string }) | undefined | null, scope: Scope) {
    if (!node) return;
    return this[node.type]?.(node, scope);
  }
  run(ast: Program, sandbox?: Record<string, any>) {
    for (const [key, value] of Object.entries(sandbox || {})) {
      this.scope.const(key, value);
    }

    this._preExcute(ast, this.scope);
    this._excute(ast, this.scope);
    return this.module;
  }
}

export default Interpreter;
