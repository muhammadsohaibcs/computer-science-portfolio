#include <iostream>
#include <string>
#include <cmath>
#include <map>
#include <set>
#include <vector>
using namespace std;
template <class T> 
class Node {
public:
    T data;
    Node<T>* next;
    Node(T data) {
        this->data = data;
        next = NULL;
    }
};

template <class T> 
class Stack {
    Node<T>* head;
public:
    Stack() {
        head = NULL;
    }

    void push_front(T value) {
        Node<T>* newNode = new Node<T>(value);
        newNode->next = head;
        head = newNode;
    }

    void pop_front() {
        if (head != NULL) {
            Node<T>* temp = head;
            head = head->next;
            delete temp;
        } else {
            cout <<"Stack is Empty\n";
        }
    }

    T top() {
        if (head != NULL)
            return head->data;
        throw runtime_error("Stack is empty!");
    }

    bool isEmpty() {
        return head == NULL;
    }
};

int precedence(char op) {
    if (op == '^') return 3;
    if (op == '*' || op == '/') return 2;
    if (op == '+' || op == '-') return 1;
    return 0;
}
string reverse(string a) {
    Stack<char> s1;
    for (char b : a) {
        if (isalnum(b) || b == '(' || b == ')' || b == '{' || b == '}' || b == '[' || b == ']' || b == '+' || b == '-' || b == '*' || b == '/' || b == '^')
            s1.push_front(b);
        else
            return "This expression is not correct";
    }

    string reverse1 = "";
    while (!s1.isEmpty()) {
        char ch = s1.top();
        if (ch == '(') reverse1 += ')';
        else if (ch == ')') reverse1 += '(';
        else if (ch == '{') reverse1 += '}';
        else if (ch == '}') reverse1 += '{';
        else if (ch == '[') reverse1 += ']';
        else if (ch == ']') reverse1 += '[';
        else reverse1 += ch;
        s1.pop_front();
    }
    return reverse1;
};

string infixToPostfix(string a) {
    string postfix = "";
    Stack<char> s1;
    for (char b : a) {
        if (isalnum(b)) {
            postfix += b;
        }
        else if (b == '(' || b == '{' || b == '[') {
            s1.push_front(b);
        }
        else if (b == ')' || b == '}' || b == ']') {
            char openBracket = (b == ')') ? '(' : (b == '}') ? '{' : '[';
            while (!s1.isEmpty() && s1.top() != openBracket) {
                postfix += s1.top();
                s1.pop_front();
            }
            if (!s1.isEmpty()) s1.pop_front();
        }
        else {
            while (!s1.isEmpty() && 
                   (precedence(b) <= precedence(s1.top()))) {
                postfix += s1.top();
                s1.pop_front();
            }
            s1.push_front(b);
        }
    }
    while (!s1.isEmpty()) {
        postfix += s1.top();
        s1.pop_front();
    }
    return postfix;
}

string infixToPrefix(string a) {
    string rev = reverse(a);
    if (rev == "This expression is not correct")
        return rev;
    string prefix = infixToPostfix(rev);
    return reverse(prefix);
}
string replaceVars(string prefix, map<char, int>& values) {
    string result = "";
    for (char ch : prefix) {
        if (isalpha(ch)) {
            result += to_string(values[ch]) + " "; 
        } else {
            result += ch;
            result += " "; 
        }
    }
    return result;
};
int evaluatePrefix(string expr) {
    Stack<int> stack;
    vector<string> tokens;
    string token = "";
    for (char ch : expr) {
        if (ch == ' ') {
            if (!token.empty()) {
                tokens.push_back(token);
                token = "";
            }
        } else {
            token += ch;
        }
    }
    if (!token.empty()) tokens.push_back(token);
    for (int i = tokens.size() - 1; i >= 0; i--) {
        string tk = tokens[i];
        if (isdigit(tk[0])) {
            stack.push_front(stoi(tk));
        } else {
            int op1 = stack.top(); stack.pop_front();
            int op2 = stack.top(); stack.pop_front();
            if (tk == "+") stack.push_front(op1 + op2);
            else if (tk == "-") stack.push_front(op1 - op2);
            else if (tk == "*") stack.push_front(op1 * op2);
            else if (tk == "/") stack.push_front(op1 / op2);
            else if (tk == "^") stack.push_front(pow(op1, op2));
        }
    }
    return stack.top();
};

int main() {
    string infix;
    cout << "Enter an infix expression: ";
    getline(cin, infix); 
    string prefix = infixToPrefix(infix);
    if (prefix=="This expression is not correct"){
        return 0;
    }
    cout << "Prefix expression: " << prefix << endl;
    set<char> variables;
    for (char ch : prefix) {
        if (isalpha(ch)) {
            variables.insert(ch);
        }
    }
    map<char, int> values;
    for (char var : variables) {
        int val;
        cout << "Enter value for " << var << ": ";
        cin >> val;
        values[var] = val;
    }
    string numericPrefix = replaceVars(prefix, values);
    int result = evaluatePrefix(numericPrefix);
    cout << "Evaluated Result: " << result << endl;
}
