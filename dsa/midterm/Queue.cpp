#include "Queue.h"
using namespace std;
    void PriorityQueue::enqueue(Node * value){
        while (!s1.isEmpty()&& s1.top()->age < value->age){
            s2.push_front(s1.top());
            s1.pop_front();
        }
        s1.push_front(value);
        while (!s2.isEmpty()){
            s1.push_front(s2.top());
            s2.pop_front();
        }
    }
    void PriorityQueue:: dequeue(){
        s1.pop_front();
    }
    Node* PriorityQueue:: top(){
        return s1.top();
    }
    bool PriorityQueue:: isEmpty(){
        return s1.isEmpty();
    }
    void PriorityQueue:: display() {
        s1.displayq();
    }
