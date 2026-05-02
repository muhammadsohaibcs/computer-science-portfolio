#include <iostream>
#include <cmath>
using namespace std;
struct Node{
    int id;
    Node *next,*prev;
    Node(int x){
        this->id=x;
        next=NULL;
        prev=NULL;
    }
};
Node *first=NULL;
Node *last=NULL;

Node *curr;
void InsertAtEnd();
void display();
void swapAlternateNodes();
void DeleteFromEnd();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to Swap Pair Wise from last to end"<<endl;
        cout<<"4 to print original List"<<endl;
        cout<<"5 to Exit"<<endl;
        cout<<"Enter what you want to do "<<endl;
        cin>>number;
        switch(number){
            case 1:
            InsertAtEnd();
            break;
            case 2:
            DeleteFromEnd();
            break;
            case 3:
            swapAlternateNodes();
            break;
            case 4:
            display();
            break;
            case 5:
            cout<<"Ending the program "<<endl;
            break;
            default:
            cout<<"Enter a valid number "<<endl;
        }

    }while(number!=5);

    return 0;
}
void InsertAtEnd(){
    int n;
    cout<<"Enter id"<<endl;
    cin>>n;
    curr =new Node(n);
    if(first==NULL){
        first=last=curr;
    }else{
        last->next=curr;
        curr->prev=last;
        last=curr;
    }

}
void DeleteFromEnd(){
    if(first==NULL){
        cout<<"List is empty "<<endl;
    }else if(first==last){
        first=last=NULL;
    }
    else{
        curr=first;
        Node *previous=NULL;
        while(curr!=last){
            previous=curr;
            curr=curr->next;
         }last=previous;
         delete (curr);
         last->next=NULL;
    }
}
void display(){
    if(first==NULL){
        cout<<"list is empty"<<endl;
    }else{
        Node *Temp=first;
        while(Temp!=NULL){
            cout<<"ID : "<<Temp->id<<endl;
            Temp=Temp->next;
        }
        }
    }void swapAlternateNodes() {
        if (first == NULL || first->next == NULL) {
            cout << "You cannot swap" << endl;
            return;
        }
    
        Node *start = first->next;
        Node *end = last->prev;
        Node *Temp1, *Temp2;
    
        while (start != end) {
            Temp1 = start->next;
            Temp2 = end->prev;
    
            if (start->next == end) {
                start->next = end->next;
                end->prev = start->prev;
                start->prev = end;
                end->next = start;
                start->next->prev = start;
                end->prev->next = end;
                return;
            } else if (start->next == end->prev) {
                start->next = end->next;
                end->prev = start->prev;
                start->prev = Temp2;
                start->prev->next = start;
                start->next->prev = start;
                end->next = Temp1;
                end->next->prev = end;
                end->prev->next = end;
                return;
            } else {
                start->next = end->next;
                end->prev = start->prev;
                start->prev = Temp2;
                start->prev->next = start;
                start->next->prev = start;
                end->next = Temp1;
                end->next->prev = end;
                end->prev->next = end;
            }
    
            start = Temp1->next;
            end = Temp2->prev;
        }
    }
