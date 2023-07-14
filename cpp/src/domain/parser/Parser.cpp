#include "Parser.h"
#include <stdexcept>

Parser::Parser(const std::vector<Token>& tokens) : tokens(tokens), currentTokenIndex(0) {}

Token Parser::getNextToken() {
    if (currentTokenIndex < tokens.size()) {
        return tokens[currentTokenIndex++];
    } else {
        Token t;
        t.type = "EOF";
        t.value = "";
        return t;
    }
}

void Parser::consumeToken(const std::string& expectedType) {
    Token token = getNextToken();
    if (token.type != expectedType) {
        throw std::runtime_error("Syntax Error: Unexpected token '" + token.value + "'.");
    }
}

int Parser::factor() {
    Token token = getNextToken();
    if (token.type == "NUMBER") {
        try {
            return std::stoi(token.value);
        } catch (const std::invalid_argument&) {
            throw std::runtime_error("Syntax Error: Invalid number format '" + token.value + "'.");
        } catch (const std::out_of_range&) {
            throw std::runtime_error("Syntax Error: Number out of range '" + token.value + "'.");
        }
    } else if (token.value == "(") {
        int result = expression();
        consumeToken(")");
        return result;
    } else {
        throw std::runtime_error("Syntax Error: Unexpected token '" + token.value + "'.");
    }
}

int Parser::term() {
    int result = factor();
    Token token = getNextToken();
    while (token.value == "*" || token.value == "/") {
        if (token.value == "*") {
            result *= factor();
        } else {
            result /= factor();
        }
        token = getNextToken();
    }
    currentTokenIndex--; // Backtrack one position to avoid consuming the next token
    return result;
}

int Parser::expression() {
    int result = term();
    Token token = getNextToken();
    while (token.value == "+" || token.value == "-") {
        if (token.value == "+") {
            result += term();
        } else {
            result -= term();
        }
        token = getNextToken();
    }
    currentTokenIndex--; // Backtrack one position to avoid consuming the next token
    return result;
}

int Parser::parse() {
    int result = expression();
    consumeToken("EOF");
    return result;
}
