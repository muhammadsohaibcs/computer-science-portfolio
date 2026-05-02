# include <iostream>
# include <stack>
using namespace std;
void remove ( stack<string> &s1){
    stack<string> s2;
    
    while (!s1.empty()){
        if (s1.top()== "yellow"){
            s1.pop();
            continue;
        }
        s2.push(s1.top());
        s1.pop();
    }
    while (!s2.empty()){
        s1.push(s2.top());
        s2.pop();
    }
}
int main(){
    stack<string> s1;
    s1.push("yellow");
    s1.push("Blue");
    s1.push("red");
    s1.push("Blue");
    s1.push("yellow");
    s1.push("red");
    s1.push("green");
    s1.push("red");
    s1.push("yellow");
    remove ( s1);
    while (!s1.empty()){
        cout<< s1.top()<<" ";
        s1.pop();
    }

}
