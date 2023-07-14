// app.js

import FIO from "./utils/FIO.js";
import Lexer from "./lexer/Lexer.js";
import Parser from "./parser/Parser.js";

const filePath = "f:./main.dwf";
const sourceCode = FIO.readFile(filePath);

const lexer = new Lexer(sourceCode);
const tokens = lexer.lex();

const parser = new Parser(tokens);
const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));
