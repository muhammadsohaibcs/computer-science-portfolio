
#include "Stack.h"
#include <iostream>
using namespace std;

Stack::Stack() {
    head = nullptr;
}

void Stack::push_front(Node* node) {
    NodeStack* newNode = new NodeStack(node);
    newNode->next = head;
    head = newNode;
}

void Stack::pop_front() {
    if (head != nullptr) {
        NodeStack* temp = head;
        head = head->next;
        delete temp;
    } else {
        cout << "Stack is Empty\n";
    }
}

Node* Stack::top() {
    if (head != nullptr)
        return head->data;
    throw runtime_error("Stack is empty!");
}

bool Stack::isEmpty() {
    return head == nullptr;
}

void Stack::display() {
    if (head == nullptr) {
        cout << "No Records Found";
        return;
    }

    NodeStack* temp = head;

    printf(" | %-7s | %-9s | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n", 
        "visitID", "patientID", "appointmentNo", "visitDate", "department", "disease", "doctorName", "medicines");
    cout << "------------------------------------------------------------------------------------------------------------------------------------------------" << endl;

    while (temp != nullptr) {
        Node* node = temp->data;
        printf(" | %-7s | %-9d | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n",
            node->visitID.c_str(),
            node->patientID,
            node->appointmentNo.c_str(),
            node->visitDate.c_str(),
            node->department.c_str(),
            node->disease.c_str(),
            node->doctorName.c_str(),
            node->medicines.c_str()
        );
        cout << "-------------------------------------------------------------------------------------------------------------------------------------------------" << endl;

        temp = temp->next;
    }
    cout << endl;
}
void Stack::displayq() {
    if (head == nullptr) {
        cout << "No Records Found";
        return;
    }
    NodeStack* node = head;
    printf(" | %-7s | %-9s | %-4s | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n", 
        "visitID", "patientID","Age", "appointmentNo", "visitDate", "department", "disease", "doctorName", "medicines");
    cout << "----------------------------------------------------------------------------------------------------------------------------------------------" << endl;

    while (node != NULL) {
        Node* temp = node->data;
        printf(" | %-7s | %-9d | %-4d | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n",
            temp->visitID.c_str(),
            temp->patientID,
            temp->age,
            temp->appointmentNo.c_str(),
            temp->visitDate.c_str(),
            temp->department.c_str(),
            temp->disease.c_str(),
            temp->doctorName.c_str(),
            temp->medicines.c_str()
        );
        cout << "-------------------------------------------------------------------------------------------------------------------------------------------------" << endl;
        node = node->next;
    }
    cout << endl;
};
