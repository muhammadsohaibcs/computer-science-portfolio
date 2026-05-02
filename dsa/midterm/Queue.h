#pragma once
#include "stack.h"

using namespace std;
class PriorityQueue{
    Stack s1;
    Stack  s2;
    public:
    void enqueue(Node * value);
    void dequeue();
    Node* top();
    bool isEmpty();
    void display() ;
};