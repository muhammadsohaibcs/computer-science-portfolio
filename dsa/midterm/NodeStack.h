#pragma once
#include "Node.h"

class NodeStack {
public:
    Node* data;
    NodeStack* next;

    NodeStack(Node* d);
};
