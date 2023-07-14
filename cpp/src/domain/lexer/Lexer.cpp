#include "Lexer.h"
#include <sstream>

Lexer::Lexer(const std::string& input) : input(input) {}

void Lexer::tokenize() {
    std::stringstream ss(input);
    std::string token;
    
    while (ss >> token) {
        // Check if the token ends with a parenthesis
        if (token.back() == '(' || token.back() == ')') {
            // Split the token into two separate tokens
            std::string value = token.substr(0, token.size() - 1);
            std::string parenthesis = token.substr(token.size() - 1);
            
            // Add the value token
            Token valueToken;
            valueToken.type = "NUMBER";
            valueToken.value = value;
            tokens.push_back(valueToken);
            
            // Add the parenthesis token
            Token parenthesisToken;
            parenthesisToken.type = "PARENTHESIS";
            parenthesisToken.value = parenthesis;
            tokens.push_back(parenthesisToken);
        } else {
            // Add the token as is
            Token t;
            t.type = "NUMBER";
            t.value = token;
            tokens.push_back(t);
        }
    }
}

std::vector<Token> Lexer::getTokens() const {
    return tokens;
}
