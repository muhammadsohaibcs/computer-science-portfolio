
#pragma once
#include "Node.h"
class LinkedList{
    Node* head;
    Node* tail;
    public:
    LinkedList(){
        head = NULL;
        tail = NULL;
    }
    void insert(Node* newNode);
    void deletePatient (int patientID);
    void patientRecord(int patientID);
    void patientsByAge();
    void display();
    void saveRecords();
};