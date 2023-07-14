#ifndef PARSER_H
#define PARSER_H

#include "../lexer/Lexer.h"

class Parser {
private:
    std::vector<Token> tokens;
    size_t currentTokenIndex;

    Token getNextToken();
    void consumeToken(const std::string& expectedType);
    int factor();
    int term();
    int expression();

public:
    Parser(const std::vector<Token>& tokens);
    int parse();
};

#endif
