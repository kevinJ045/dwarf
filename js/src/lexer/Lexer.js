import Token from "./Token.js";

class Lexer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
    this.current = 0;
    this.line = 1;
    this.column = 1;
  }

  lex() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token("EOF", "", this.line, this.column));
    return this.tokens;
  }

  scanToken() {
    const char = this.advance();
    switch (char) {
      case "(": this.addToken("LEFT_PAREN"); break;
      case ")": this.addToken("RIGHT_PAREN"); break;
      case "{": this.addToken("LEFT_BRACE"); break;
      case "}": this.addToken("RIGHT_BRACE"); break;
      case ",": this.addToken("COMMA"); break;
      case ":": this.addToken("COLON"); break;
      case ";": this.addToken("SEMICOLON"); break;
      case "=": this.addToken("EQUAL"); break;
      case "+": this.addToken("PLUS"); break;
      case "-": this.addToken("MINUS"); break;
      case "*": this.addToken("STAR"); break;
      case "/": this.addToken("SLASH"); break;
      case ".": this.addToken("DOT"); break;
      case '"': this.string('"'); break;
      case "`": this.string("`"); break;
      case "'": this.string("'"); break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace characters
        break;
      case "\n":
        this.line++;
        this.column = 1;
        break;
      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
        }
        break;
    }
    
  }

  isKeyword(text) {
    const keywords = ["class", "extends", "delete", "fun", "push", "pull", "pop", "dump", "type", "import", "export", "var", "static"];
    return keywords.includes(text);
  }

  string(type) {
    while (this.peek() !== type && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }

    this.advance();

    const value = this.input.substring(this.start + 1, this.current - 1);
    this.addToken("STRING", value);
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = parseFloat(this.input.substring(this.start, this.current));
    this.addToken("NUMBER", value.toString());
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const value = this.input.substring(this.start, this.current);
    if (this.isKeyword(value)) {
      this.addToken(value.toUpperCase(), value);
    } else {
      this.addToken("IDENTIFIER", value);
    }
  }

  addToken(type, literal = null) {
    const text = this.input.substring(this.start, this.current);
    const token = new Token(type, text, this.line, this.column);
    if (literal !== null) {
      token.literal = literal;
    }
    this.tokens.push(token);
  }

  advance() {
    const char = this.input.charAt(this.current);
    this.current++;
    this.column++;
    return char;
  }

  peek() {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.input.charAt(this.current);
  }

  peekNext() {
    if (this.current + 1 >= this.input.length) {
      return "\0";
    }
    return this.input.charAt(this.current + 1);
  }

  isAtEnd() {
    return this.current >= this.input.length;
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  isAlpha(char) {
    return /[a-zA-Z_]/.test(char);
  }

  isAlphaNumeric(char) {
    return this.isDigit(char) || this.isAlpha(char);
  }
}

export default Lexer;
