#include <iostream>
using namespace std;
struct Node{
    int id;
    Node *next;
    string Name;
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
void NodeSwap();
void DeleteFromEnd();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to NodeSwap"<<endl;
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
            NodeSwap();
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
            cout<<"ID : "<<Temp->id<<" Name : "<<Temp->Name<<endl;
            Temp=Temp->next;
        }
        }
    }


void NodeSwap(){
    int id1;
    int id2;
    cout<<"Enter id id of first node "<<endl;
    cin>>id1;
    cout<<"Enter the id of 2nd node  "<<endl;
    cin>>id2;

    if(id1==id2){
        cout<<"Both the ids are same"<<endl;
        return;
    }
    Node *node1=first,*previous1=NULL,*Temp;
    Node *node2=first,*previous2=NULL;
    while(node1!=NULL && node1->id!=id1){
        previous1=node1;
        node1=node1->next;
    }
    while(node2!=NULL && node2->id!=id2){
        previous2=node2;
        node2=node2->next;
    }
    if(node1==NULL || node1==NULL){
        cout<<"one or both of the ID not found"<<endl;
        return;
    }
        if(previous1!=NULL){
            previous1->next=node2;
        }else{
            first=node2;
        }
        if(previous2!=NULL){
            previous2->next=node1;
        }else{
            first=node1;
        }
        Temp=node2->next;
        node2->next=node1->next;
        node1->next=Temp;
        if(node1==last){
            last=node2;
        }else if(node2==last){
            last=node1;
        }
    


    } 
