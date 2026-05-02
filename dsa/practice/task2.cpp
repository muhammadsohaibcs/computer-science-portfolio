#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next = NULL;
    Node* prev = NULL;
    Node(int a) {
        data = a;
    }
};
struct node {
    int data;
    node* next = NULL;
    node(int a) {
        data = a;
    }
};
class doublyLinkedList {
public:
    Node* first = NULL;
    Node* last = NULL;

    void insertAtEnd(int value) {
        Node* curr = new Node(value);
        if (first == NULL) {
            first = curr;
            last = curr;
        } else {
            last->next = curr;
            curr->prev = last;
            last = curr;
        }
    }

    void reverse() {
        Node* prev = NULL;
        Node* curr = first;
        last = first;
        Node* next = NULL;
        while (curr) {
            next = curr->next;
            curr->prev = next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        first = prev;
    }

    void display() {
        Node* temp = first;
        while (temp != NULL) {
            cout << temp->data << " ";
            temp = temp->next;
        }
        cout << endl;
    }

    void swapNodes(int a, int b) {
        if (a == b) return;

        Node* curr1 = first, * prev1 = NULL;
        while (curr1 != NULL && curr1->data != a) {
            prev1 = curr1;
            curr1 = curr1->next;
        }

        Node* curr2 = first, * prev2 = NULL;
        while (curr2 != NULL && curr2->data != b) {
            prev2 = curr2;
            curr2 = curr2->next;
        }

        if (curr1 == NULL || curr2 == NULL) {
            cout << "One or both elements not found" << endl;
            return;
        }

        if (prev1 != NULL) prev1->next = curr2;
        else first = curr2;

        if (prev2 != NULL) prev2->next = curr1;
        else first = curr1;

        Node* temp = curr1->next;
        curr1->next = curr2->next;
        curr2->next = temp;

        if (curr1->next != NULL) curr1->next->prev = curr1;
        if (curr2->next != NULL) curr2->next->prev = curr2;

        temp = curr1->prev;
        curr1->prev = curr2->prev;
        curr2->prev = temp;

        if (curr1->next == NULL) last = curr1;
        if (curr2->next == NULL) last = curr2;

        first->prev = NULL;
    }
    void swapAlternate() {
        if (first == NULL || first->next == NULL) return; 
    
        Node* curr1 = first;
        Node* curr2= last;
    
        while (curr1 != curr2  ) {
            if ( curr1->next == curr2){
                return;

            }
            

            else if ( curr1->next->next== curr2->prev){
                Node * temp1 = curr1 ->next;
                curr1 ->next = curr2 ->prev;
                Node * temp2 = curr2->prev->prev ;
                curr2 ->prev ->next = temp1 ;
                curr2 ->prev ->prev = curr1;
                temp2->next= temp1;
                temp1 ->prev = temp2;
                curr2->prev = temp1;
                temp1 ->next =curr2;
                return;

            }
           

            else {
                Node * temp1 = curr1 ->next;
                curr1 ->next = curr2 ->prev;
                Node * temp2 = curr2->prev->prev ;
                curr2 ->prev ->next = temp1 ->next;
                curr2 ->prev ->prev = curr1;
                temp2->next= temp1;
                temp1 ->prev = temp2;
                curr2->prev = temp1;
                temp1 ->next =curr2;

            }

           curr2 = curr2->prev->prev;
           curr1 = curr1 ->next->next;
            
        }
    }
    

    

    Node* singleToDouble(node* head) {
        if (head == NULL) return NULL;

        Node* newHead = new Node(head->data);
        Node* tail = newHead;
        node* temp = head->next;

        while (temp != NULL) {
            Node* newNode = new Node(temp->data);
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
            temp = temp->next;
        }
        return newHead;
    }
};

class LinkedList {
public:
    node* first = NULL;
    node* last = NULL;

    void insertAtEnd(int value) {
        node* curr = new node(value);
        if (first == NULL) {
            first = curr;
            last = curr;
        } else {
            last->next = curr;
            last = curr;
        }
    }

    void display() {
        node* temp = first;
        while (temp != NULL) {
            cout << temp->data << " ";
            temp = temp->next;
        }
        cout << endl;
    }
    
};

int main() {
    doublyLinkedList a;
    a.insertAtEnd(12);
    a.insertAtEnd(15);
    a.insertAtEnd(19);
    a.insertAtEnd(14);
    a.insertAtEnd(14);
    a.insertAtEnd(14);
    
    
   
    
    a.swapAlternate();
    a.display();

    LinkedList b;
    b.insertAtEnd(12);
    b.insertAtEnd(162);
    b.insertAtEnd(190);
    b.insertAtEnd(122);
    Node* c = a.singleToDouble(b.first);
    doublyLinkedList d;
    d.first = c;
    d.display();
}
