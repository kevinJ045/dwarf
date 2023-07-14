#include <iostream>
#include "../src/domain/lexer/Lexer.h"
#include "../src/domain/parser/Parser.h"

int main() {
    // Example usage of Lexer and Parser
    std::string input = "1 + 2 * (3 - 4) *";
    
    // Lexical Analysis
    Lexer lexer(input);
    lexer.tokenize();
    auto tokens = lexer.getTokens();

    // Parsing
    Parser parser(tokens);
    int result = parser.parse();
    
    std::cout << "Result: " << result << std::endl;

    return 0;
}
