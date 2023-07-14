import Token from "./Token.js";
import * as acorn from "acorn";

export default class Tokenizer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
  }

  tokenize() {
    const ast = acorn.parse(this.input, {
      sourceType: "module",
      ecmaVersion: 2022,
      locations: true,
      onToken: (token) => {
        const { type, value, loc } = token;
        const { line, column } = loc.start;
        this.tokens.push(new Token(type.label, value, line, column));
      },
    });

    return this.tokens;
  }
}
