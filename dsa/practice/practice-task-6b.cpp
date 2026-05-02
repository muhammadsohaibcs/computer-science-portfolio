#include <iostream>
#include <stack>

#include <unordered_map>
#include <cmath>
using namespace std;
class Stack {
private:
    struct Node {
        double data;
        Node* next;
        Node(double val) : data(val), next(nullptr) {}
    };
    Node* top;
public:
    Stack() : top(nullptr) {}
    ~Stack() {
        while (!isEmpty()) pop();
    }
    void push(double val) {
        Node* newNode = new Node(val);
        newNode->next = top;
        top = newNode;
    }
    double pop() {
        if (isEmpty()) return 0;
        double val = top->data;
        Node* temp = top;
        top = top->next;
        delete temp;
        return val;
    }
    double peek() {
        return isEmpty() ? 0 : top->data;
    }
    bool isEmpty() {
        return top == nullptr;
    }
};

int precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    if (op == '^') return 3;
    return 0;
}


string infixToPostfix(const string &infix) {
    Stack st;
    string postfix;
    
    for (char ch : infix) {
        if (isalnum(ch)) {
            postfix += ch; 
        } else if (ch == '(') {
            st.push(ch);
        } else if (ch == ')') {
            while (!st.isEmpty() && st.peek() != '(') {
                postfix += st.pop();
            }
            st.pop(); 
        } else { 
            while (!st.isEmpty() && precedence(st.peek()) >= precedence(ch)) {
                postfix += st.pop();
            }
            st.push(ch);
        }
    }
    while (!st.isEmpty()) {
        postfix += st.pop();
    }
    return postfix;
}

double evaluatePostfix(const string &postfix, unordered_map<char, double> &variables) {
    Stack st;
    for (char ch : postfix) {
        if (isalnum(ch)) {
            st.push(variables[ch]); 
        } else {
            double val2 = st.pop();
            double val1 = st.pop();
            switch (ch) {
                case '+': st.push(val1 + val2); break;
                case '-': st.push(val1 - val2); break;
                case '*': st.push(val1 * val2); break;
                case '/': st.push(val1 / val2); break;
                case '^': st.push(pow(val1, val2)); break;
            }
        }
    }
    return st.pop();
}

int main() {
    string infix;
    cout << "Enter an infix expression: ";
    cin >> infix;
    string postfix = infixToPostfix(infix);
    cout << "Postfix expression: " << postfix << endl;
    
    unordered_map<char, double> variables;
    for (char ch : postfix) {
        if (isalnum(ch) && variables.find(ch) == variables.end()) {
            cout << "Enter value for " << ch << ": ";
            cin >> variables[ch];
        }
    }
    double result = evaluatePostfix(postfix, variables);
    cout << "Result: " << result << endl;
    return 0;
}
