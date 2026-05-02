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
class Stack {
    Node<T>* head;
public:
    Stack() {
        head = NULL;
    }

    void push_front(T value) {
        Node<T>* newNode = new Node<T>(value);
        newNode->next = head;
        head = newNode;
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

    T top() {
        if (head != NULL)
            return head->data;
        throw runtime_error("Stack is empty!");
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
};
template <class T>
class Queue{
    Stack<T> s1;
    Stack <T> s2;
    public:
    void enqueue(T value){
        while (!s1.isEmpty()){
            s2.push_front(s1.top());
            s1.pop_front();
        }
        s1.push_front(value);
        while (!s2.isEmpty()){
            s1.push_front(s2.top());
            s2.pop_front();
        }
    }
    void dequeue(){
        s1.pop_front();
    }
    T top(){
        return s1.top();
    }
    bool isEmpty(){
        return s1.isEmpty();
    } 
    void display() {
        Stack<T> temp = s1.top();
        while (!temp.isEmpty) {
            cout << temp->top()<< " ";
            temp ->pop_front;
        }
        cout << endl;
    }


};
int main() {
    Queue <Stack <int>> q1;
    Stack<int> s1;
    s1.push_front(9);
    s1.push_front(5);
    s1.push_front(3);
    Stack<int> s2;
    s2.push_front(1);
    s2.push_front(2);
    s2.push_front(4);
    q1.enqueue(s1);
    q1.enqueue(s2);
    q1.enqueue(s1);
    Stack<int> temp = q1.top();
        while (!temp.isEmpty()) {
            cout << temp.top()<< " ";
            temp .pop_front();
        }
        cout << endl;
    cout << endl;
    q1.dequeue();
    Stack<int> temp2 = q1.top();
        while (!temp2.isEmpty()) {
            cout << temp2.top()<< " ";
            temp2 .pop_front();
        }

}
