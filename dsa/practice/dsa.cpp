# include <iostream>
using namespace std;
struct Node{
    int marks;
    Node* next = NULL;

};
Node * first = NULL;
Node * last = NULL;

void reverse(){
    Node* temp =first;
    helper(temp);
}
void helper(Node* temp){
    if (temp == NULL){
        return;
    }
    else{
        helper(temp->next);
        cout << temp->marks<< " ";
    }
    cout<< endl;
}
void reverseLoop(){
    Node * temp2 = last;
    while (temp2!=first){
        Node * temp1 = first;
        while (temp1->next!=temp2){
            temp1 =temp1->next  ;
        }
        cout << temp2->marks <<" ";
        temp2 = temp1;
    }
    cout<< first->marks <<endl;
    
}
void reverseC(){
    if (!(first == NULL || first==last)){
        Node *pre = NULL;
        Node *curr= first;
        Node *next = curr ->next;
        last = first;
        while(next != NULL){
            curr ->next = pre;
            pre = curr;
            curr = next;
            next = next ->next;
        }
        first = curr;
        first -> next = pre;

}
}
void swapNodes(int a , int b){
    Node * curr1 = first;
    Node* prev1 = NULL;
    while (curr1!=NULL && curr1 ->marks!=a)
    {
        prev1 = curr1;
        curr1 = curr1->next ;
    }
    Node * curr2 = first;
    Node* prev2 = NULL;
    while (curr2!=NULL && curr2->marks!=b)
    {
        prev2 = curr2;
        curr2 = curr2->next ;
    }
    if (curr1 ==NULL){
        cout << "Element 1 not found";
        return;
    }
    if (prev1 ==NULL){
        first = curr2;
        
    }
    else if (prev1->next == last){
        last = curr2;
        prev1 ->next = curr2;
       
    }
    else{
        prev1 ->next = curr2;
        
    }
    if (curr2 ==NULL){
        cout << "Element 2 not found";
        return;
    }
    else if (prev2 ==first){
        first = curr1;
    }
    else if (prev2->next == last){
        last = curr1;
        prev2 ->next = curr1;
       
        
    }
    else{
        prev2 ->next = curr1;
    }
    Node* temp = curr1->next;
    curr1->next = curr2->next;
    curr2 ->next = temp;
}
bool detectLoop(Node* head) {
    Node *slow = head, *fast = head;

    while (slow && fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
void evenRemove(){
    if (first== NULL)
        cout<<"Empty";
    else{
        Node* prev = first;
        Node* curr= first->next;
        while(curr!=NULL){
            if (curr->marks %2==0){
                    prev ->next = prev->next->next;
                    curr = prev ->next;
            }
            else{
                prev = curr;
                curr = curr -> next;
            }
        }
        if (curr->marks %2==0){
        prev ->next = prev->next->next;
        if(prev->marks%2==0)
            last = NULL;
        else
            last = prev;}
    }
}
void oddRemove(){
    if (first== NULL)
        cout<<"Empty";
    else{
        Node* prev = last;
        Node* curr= last->next;
        while(curr!=last){
            if (curr->marks %2!=0){
                    prev ->next = prev->next->next;
                    curr = prev ->next;
            }
            else{
                prev = curr;
                curr = curr -> next;
            }
        }
        if (curr->data %2!=0){
        prev ->next = prev->next->next;
        last = prev;}
    }
}