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
Node *Last=NULL;

Node *curr;
int josephusProblem(Node *last,int k);
Node* CreateCircularLinkedList(int x);

int main(){
    int number;
    int k;
    cout<<"Enter the total number of persons"<<endl;
    cin>>number;
    Node *x=CreateCircularLinkedList(number);
    if(x!=NULL){
        cout<<"Enter the value of M(at which person should be killed)"<<endl;
        cin>>k;
        int lastPerson=josephusProblem(x,k);
    if(lastPerson==0){
        cout<<"You havent enter the correct value of M"<<endl;
    }else{
    cout<<"Lastperson survived is :"<<lastPerson<<endl;}
    }
    return 0;
}
int josephusProblem(Node *last,int k){
    if(k<1){
        cout<<"Invalid input it must be greater than 1"<<endl;
        return 0;
    }
    curr=last->next;
    while(last->next!=last){
        int count=1;
        while(count!=k-1){
            curr=curr->next;
            count=count+1;
        }
        
        Node *Temp=curr->next;
        curr->next=Temp->next;
        if(Temp==last){
            last=curr;
        }
        delete(Temp);
        curr=curr->next;

    }
    return last->id;
}
Node* CreateCircularLinkedList(int x){
    if(x<=0){
        cout<<"cant create a linked list for such input"<<endl;
        return NULL;
    }
    curr=new Node(1);
    Last=curr;
    Last->next=Last;
    for(int i=2;i<=x;i++){
        Node *Temp=new Node(i);
        Temp->next=Last->next;
        Last->next=Temp;
        Last=Temp;
    }
    return Last;
}
