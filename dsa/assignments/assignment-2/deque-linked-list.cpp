#include<iostream>
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
class Deque {
    Node<T>* head;
    Node<T>* tail;
public:
    Deque() {
        head = NULL;
        tail = NULL;
    }

    void push_front(T value) {
        Node<T>* newNode = new Node<T>(value);
        if (head==NULL){
            head = tail = newNode;
        }
        else{
            newNode->next = head;
            head = newNode;

        }
    }
    void push_back(T value) {
        Node<T>* newNode = new Node<T>(value);
        if (head==NULL){
            head = tail = newNode;
        }
        else{
            tail ->next = newNode;
        }
    }

    void pop_front() {
        if (head != NULL) {
            Node<T>* temp = head;
            head = head->next;
            delete temp;
        }
        else{
            cout <<"Stack is Empty\n";
        }
    }
    void pop_back() {
        if (head != NULL) {
            Node<T> * temp = head;
            while (temp ->next->next){
                temp = temp ->next;
            }
            tail = temp;
            temp->next = NULL;
            Node <T>* temp2 = temp -> next;
            delete temp;
            delete temp2;
        }
        else{
            cout <<"Stack is Empty\n";
        }
    }

    

    bool isEmpty() {
        return head == NULL;
    }

    void display() {
        Node<T>* temp = head;
        while (temp) {
            cout << temp->data << " ";
            temp = temp->next;
        }
        cout << endl;
    }
};int main() {
    Deque<int> s1;
    s1.push_front(9);
    s1.push_front(5);
    s1.push_front(3);
    s1.pop_back();
    s1.pop_front();
    s1.push_back(6);
    s1.display();
    

}
