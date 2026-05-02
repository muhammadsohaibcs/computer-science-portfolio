#include <iostream>
#include <stack>
#include <unordered_map>

using namespace std;
bool isBalanced(const string &s) {
    stack<char> st;
    unordered_map<char, char> matchingBrackets = {{')', '('}, {']', '['}, {'}', '{'}};
    unordered_map<char, int> priority = {{'(', 1}, {'{', 2}, {'[', 3}};
    
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') {
            if (!st.empty() && priority[st.top()] < priority[ch]) {
                return false;
            }
            st.push(ch);
        } else if (ch == ')' || ch == ']' || ch == '}') {
            if (st.empty() || st.top() != matchingBrackets[ch]) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string str;
    cout << "Enter a string of brackets: ";
    cin >> str;
    
    if (isBalanced(str)) {
        cout << "Balanced" << endl;
    } else {
        cout << "Not Balanced" << endl;
    }
    
    return 0;
}
