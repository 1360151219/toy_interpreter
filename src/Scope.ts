type Kind = 'const' | 'var' | 'let';
export interface Var {
  get(): any;
  set(value: any): boolean;
}

export class ScopeVar implements Var {
  kind: string;
  value: any;
  constructor(kind: Kind, value: any) {
    this.kind = kind;
    this.value = value;
  }
  get() {
    return this.value;
  }
  set(value: any): boolean {
    if (this.kind === 'const') {
      return false;
    } else {
      this.value = value;
      return true;
    }
  }
}
export class Scope {
  private content: { [key: string]: Var };
  private parent?: Scope;
  type: any;

  constructor(type: 'block' | 'function', parent?: Scope) {
    this.type = type;
    this.parent = parent;
    this.content = {};
  }

  // 使用var声明有以下特点
  // 1. 覆盖父作用域中同名变量的值
  // 2. 可以重复声明
  // 3. 声明提升，会提升到父作用域
  var(key: string, value: any) {
    const _value = new ScopeVar('var', value);
    let scope: Scope | undefined = this;

    while (Boolean(scope?.parent) && scope?.type !== 'function') {
      scope = scope?.parent;
    }

    // 覆盖父作用域中同名变量的值 + 提升
    scope.content[key] = _value;
    return true;
    // if (Object.hasOwn(scope.content, key)) {
    //   scope.content[key] = _value;
    //   this.content[key] = _value;
    // } else {
    // }
  }

  let(key: string, value: any) {
    const _value = new ScopeVar('let', value);
    if (Object.hasOwn(this.content, key)) {
      throw SyntaxError(`Identifier '${key}' has already been declared`);
    } else {
      this.content[key] = _value;
      return true;
    }
  }
  const(key: string, value: any) {
    const _value = new ScopeVar('const', value);
    if (Object.hasOwn(this.content, key)) {
      throw SyntaxError(`Identifier '${key}' has already been declared`);
    } else {
      this.content[key] = _value;
      return true;
    }
  }

  find(key: string) {
    let scope: Scope | undefined = this;
    // 先找当前作用域
    if (Object.hasOwn(scope.content, key)) {
      return scope.content[key];
    }
    while (scope?.parent) {
      if (Object.hasOwn(scope.content, key)) {
        return scope.content[key];
      }
      scope = scope?.parent;
    }

    return undefined;
  }
}
