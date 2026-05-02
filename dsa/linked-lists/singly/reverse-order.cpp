#include <iostream>
using namespace std;
struct Node{
    int id;
    string Name;
    Node *next;
    Node(int x,string y){
        this->id=x;
        this->Name=y;
        next=NULL;
    }
};
Node *first=NULL;
Node *last=NULL;
Node *curr;
void InsertAtEnd();
void display();
void ReverseOrder();
int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to printRverseOrder List"<<endl;
        cout<<"3 to print original List"<<endl;
        cout<<"4 to Exit"<<endl;
        cout<<"Enter what you want to do "<<endl;
        cin>>number;
        switch(number){
            case 1:
            InsertAtEnd();
            break;
            case 2:
            ReverseOrder();
            break;
            case 3:
            display();
            break;
            case 4:
            cout<<"Ending the program "<<endl;
            break;
            default:
            cout<<"Enter a valid number "<<endl;
        }

    }while(number!=4);

    return 0;
}
void InsertAtEnd(){
    int n;
    string x;
    cout<<"Enter id"<<endl;
    cin>>n;
    cout<<"Enter Name"<<endl;
    cin>>x;
    curr =new Node(n,x);
    if(first==NULL){
        first=last=curr;
    }else{
        last->next=curr;
        last=curr;
    }

}void display(){
    if(first==NULL){
        cout<<"list is empty"<<endl;
    }else{
        Node *Temp=first;
        while(Temp!=NULL){
            cout<<"ID : "<<Temp->id<<" Name : "<<Temp->Name<<endl;
            Temp=Temp->next;
        }
    }
}
void ReverseOrder(){
    if (first==NULL){
        cout<<"Linked list is empty"<<endl;
    }else{
    Node *prev=NULL;
    curr=first;
    while(curr!=last){
        prev=curr;
        curr=curr->next;
    }
    cout<<"ID : "<<curr->id<<" Name : "<<curr->Name<<endl;
    while(curr!=first){
        curr=prev;
        cout<<"ID : "<<curr->id<<" Name : "<<curr->Name<<endl;
        prev=NULL;
        Node *Temp=first;
        while(Temp!=curr){
            prev=Temp;
            Temp=Temp->next;
         }
    }

}}
