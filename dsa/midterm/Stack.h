
#pragma once
#include "NodeStack.h"
using namespace std;
class Stack {
    NodeStack * head;
public:
    Stack() ;
    void push_front(Node* newNode) ;
    void pop_front() ;
    Node* top() ;
    bool isEmpty() ;
    void display();
    void displayq();
};