#include <iostream>
using namespace std;
struct Node{
    int id;
    Node *next;
    Node(int x){
        this->id=x;
        next=NULL;
    }
};
Node *first=NULL;
Node *last=NULL;

Node *curr;
void InsertAtEnd();
void display();
void CheckCycle();
void DeleteFromEnd();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to CheckCycle"<<endl;
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
            CheckCycle();
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
    }

void CheckCycle(){
    curr=first;
    Node *move=first->next;
    while(move!=NULL && move->next!=NULL){
        if(curr==move){
            cout<<"Cycle Exsist"<<endl;
            return;
        }curr=curr->next;
        move=move->next->next;

    }
        cout<<"Cycle does not exsist"<<endl;
    

}