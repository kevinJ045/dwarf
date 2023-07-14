#ifndef LEXER_H
#define LEXER_H

#include <string>
#include <vector>

struct Token {
    std::string type;
    std::string value;
};

class Lexer {
private:
    std::string input;
    std::vector<Token> tokens;

public:
    Lexer(const std::string& input);
    void tokenize();
    std::vector<Token> getTokens() const;
};

#endif
