// import Token from "./Token.js";

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }
    return statements;
  }

  statement() {

    if (this.match("IDENTIFIER") && this.checkNext("DOT")) {
      // console.log(this.peek());
      return this.mergeDots();
    }

    if (this.match("IDENTIFIER") && this.checkNext("EQUAL")) {
      return this.assignment();
    }

    // console.log(this.match("IDENTIFIER"), this.peekNext());

    if (this.match("IDENTIFIER") && this.checkNext("LEFT_PAREN")) {
      return this.functionCall();
    }

    if (this.match("CLASS") && this.checkNext("IDENTIFIER")) {
      this.advance();
      if(this.checkNext("LEFT_BRACE")) return this.classDeclaration();
    }
    if (this.match("SEMICOLON")) {
      return this.advance();
    }
    throw new Error(`Unexpected token '${this.peek().type}' at line ${this.peek().line}, column ${this.peek().column}`);
  }

  mergeDots() {
    let identifier = this.previous().literal;

    while (this.checkNext("DOT")) {
      this.consume("IDENTIFIER", "Expect identifier after '.'");
      identifier += `.${this.previous().literal}`;
      this.advance(); // Consume the DOT
    }

    return { type: "IDENTIFIER", literal: identifier };
  }


  classDeclaration() {
    const name = this.consume("IDENTIFIER", "Expect class name after 'class'");
    let superclass = null;
    if (this.match("EXTENDS")) {
      this.consume("EXTENDS", "Expect 'extends' after superclass name");
      superclass = this.consume("IDENTIFIER", "Expect superclass name after 'extends'");
    }

    this.consume("LEFT_BRACE", "Expect '{' after class declaration");
    const methods = [];
    while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
      methods.push(this.method());
    }
    this.consume("RIGHT_BRACE", "Expect '}' after class body");

    return { type: "ClassDeclaration", name, superclass, methods };
  }

  method() {
    const returnType = this.consume("IDENTIFIER", "Expect method return type");
    const name = this.consume("IDENTIFIER", "Expect method name");
    this.consume("LEFT_PAREN", "Expect '(' after method name");
    const parameters = this.parameterList();
    this.consume("RIGHT_PAREN", "Expect ')' after method parameters");
    this.consume("LEFT_BRACE", "Expect '{' before method body");
    const body = this.block();
    this.consume("RIGHT_BRACE", "Expect '}' after method body");

    return { type: "MethodDeclaration", returnType, name, parameters, body };
  }

  arguments() {
    const args = [];
    while (!this.check("RIGHT_PAREN") && !this.isAtEnd()) {
      const arg = this.argument();
      args.push(arg);

      if (!this.match("COMMA")) {
        break;
      }
    }
    return args;
  }

  argument() {
    const name = this.consume("IDENTIFIER", "Expect argument name");

    if (this.match("COLON")) {
      const value = this.expression();
      return { type: "Argument", name, value };
    }

    return { type: "Argument", name };
  }

  parameterList() {
    const parameters = [];
    if (!this.check("RIGHT_PAREN")) {
      do {
        parameters.push(this.parameter());
      } while (this.match("COMMA"));
    }
    return parameters;
  }

  parameter() {
    let name = this.consume("IDENTIFIER", "Expect parameter name"), type = "any";

    if(this.match('IDENTIFIER')){
      type = name;
      name = this.consume("IDENTIFIER", "Expect parameter type");
    }

    if (this.match("COLON")) {
      const value = this.expression();
      return { type: "Argument", datatype: type, name, value };
    }

    return { type: "Argument", datatype: type, name, value: name };
  }

  functionCall() {
    const identifier = this.consume("IDENTIFIER", "Expect function identifier");
    this.consume("LEFT_PAREN", "Expect '(' after function identifier");
    let _arguments = [];
    if(this.checkNext('IDENTIFIER')){
      _arguments = this.parameterList();
    }
    this.consume("RIGHT_PAREN", "Expect ')' after function arguments");

    return { type: "FunctionCall", identifier, arguments: _arguments };
  }

  assignment() {
    const name = this.consume("IDENTIFIER", "Expect variable name after assignment");
    this.consume("EQUAL", "Expect '=' after variable name");
    const value = this.expression();
    return { type: "Assignment", name, value };
  }

  expression() {
    return this.primary();
  }

  primary() {
    const token = this.advance();
    console.log(token);
    switch (token.type) {
      case "STRING":
        return { type: "String", value: token.literal };
      case "NUMBER":
        return { type: "Number", value: token.literal };
      case "TRUE":
        return { type: "Bool", value: true };
      case "FALSE":
        return { type: "Bool", value: false };
      case "IDENTIFIER":
        return this.memberExpression(token);
      default:
        throw new Error(`Unexpected token '${token.type}' at line ${token.line}, column ${token.column}`);
    }
  }

  memberExpression(identifier) {
    let expression = { type: "Identifier", name: identifier.lexeme };

    while (this.match("DOT")) {
      const property = this.consume("IDENTIFIER", "Expect property name after '.'");
      expression = { type: "MemberExpression", object: expression, property: property.lexeme };
    }

    return expression;
  }

  block() {
    const statements = [];
    while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
      statements.push(this.statement());
    }
    return statements;
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        // this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }

  checkNext(type, index = 1) {
    if (this.current + index >= this.tokens.length) {
      return false;
    }
    return this.tokens[this.current + index].type === type;
  }

  peekNext(type) {
    if (this.current + 1 >= this.tokens.length) {
      return false;
    }
    return this.tokens[this.current + 1];
  }

  consume(type, errorMessage) {
    if (this.check(type)) {
      return this.advance();
    }

    throw new Error(`${errorMessage} at line ${this.peek().line}, column ${this.peek().column}`);
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  peek() {
    return this.tokens[this.current];
  }

  isAtEnd() {
    return this.current >= this.tokens.length || this.peek().type === "EOF";
  }
}

export default Parser;
