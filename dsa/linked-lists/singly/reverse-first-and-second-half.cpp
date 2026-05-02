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
void ReverseHalf();
void DeleteFromEnd();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to Reverse first half and second half of linked list"<<endl;
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
            ReverseHalf();
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
void ReverseHalf(){
    if(first==NULL){
        cout<<"Linked List is empty "<<endl;
    }else{
        int count=0;
        Node *Temp=first;
        while(Temp!=NULL){
            ++count;
            Temp=Temp->next;
        }
        int count1=count/2;
        int count2=round(count/2.0)+1;
        
        Node *node1=first;
        Node *node2=NULL;
        int countx=1;
        while(countx!=count1){
            node1=node1->next;
            ++countx;
        }
        if(count1+1==count2){
            node2=node1->next;
        }else{
            node2=node1->next->next;
        }
       Node *store1=node1->next;
       Node *store=node2;
        //reverse of first half
        Node *Temp1=NULL;
        Node *previous1=NULL;
        Node *p=first;
        while(p!=node1){
            Temp1=p->next;
            p->next=previous1;
            previous1=p;
            p=Temp1;
        }p->next=previous1;
        Node *copyfirst=first;
        first=p;
       

        //reverse of second half
        Node *Temp2=NULL;
        Node *previous2=NULL;
        Node *p1=node2;
        while(p1!=NULL){
            Temp2=p1->next;
            p1->next=previous2;
            previous2=p1;
            p1=Temp2;
        }
        Node *copylast=last;
        last=store;
        
        if(count1+1==count2){
            copyfirst->next=copylast;
            
        }else{
            copyfirst->next=store1;
            store1->next=copylast;
            
        }

   }

}    

