#include <iostream>
#include <cmath>
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
void swapPairWise();
void DeleteFromEnd();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to Swap Pair Wise"<<endl;
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
            swapPairWise();
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
    void swapPairWise(){
        if(first==NULL){
            cout<<"List is empty"<<endl;
        }else{
        curr=first;
        while(curr!=NULL && curr->next!=NULL){
            Node *node1=curr;
            Node *node2=curr->next;
            Node *Temp;
            Node *previous;
            if(node1==first){
                node1->next=node2->next;
                node2->next=node1;
                first=node2;
                if(node2==last){
                    last=node1;
        }
                
            }else if(node2==last){
                Temp=first;
                previous=NULL;
                while(Temp!=node1){
                    previous=Temp;
                    Temp=Temp->next;
                }
                Node *Temp2=node2->next;
                previous->next=node2;
                node2->next=node1;
                node1->next=Temp2;
                last=node1;
            }else{
                Temp=first;
                previous=NULL;
                while(Temp!=node1){
                    previous=Temp;
                    Temp=Temp->next;
                }
                Node *Temp2=node2->next;
                previous->next=node2;
                node2->next=node1;
                node1->next=Temp2;
                


            }curr=node1->next;




            
        }}
    }
