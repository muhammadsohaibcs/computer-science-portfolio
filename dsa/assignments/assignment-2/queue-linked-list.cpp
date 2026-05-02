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
class Queue {
    Node<T>* tail;
public:
    Queue() {
        tail = NULL;
    }
    void push(T value) {
        Node<T>* newNode = new Node<T>(value);
        if (tail==NULL){
            tail = newNode;
            tail ->next = tail;
        }
        else{
            newNode ->next = tail->next;
            tail ->next = newNode;
            tail = newNode;
        }
    }
    void pop() {
        if (tail && tail->next ){
            Node<T>* temp = tail ->next;
            tail->next = tail ->next->next;
            temp->next = NULL;
            delete temp;
        }
        else if (tail){
            tail = NULL;
        }
        else{
            cout <<"Queue is Empty\n";
        }
    }

    void display() {
        if (tail==NULL){
            cout <<"Queue is Empty\n";
            return;
        }
        Node<T>* temp = tail->next;
        while (temp!=tail) {
            cout << temp->data << " ";
            temp = temp->next;
        }
        cout << tail ->data << endl;
    }
};
int main() {
    Queue<int> s1;
    s1.push_back(9);
    s1.push_back(5);
    s1.push_back(3);
    s1.pop_front();
    s1.display();}