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
Node *Evenfirst=NULL,*Evenlast=NULL;
Node *ODDfirst=NULL,*ODDlast=NULL;

Node *curr;
void InsertAtEnd();
void display();
void SeprateList();
void DeleteFromEnd();
void oddDisplay();
void evenDisplay();



int main(){
    int number;
    do{
        cout<<"1 to InsertAtEnd"<<endl;
        cout<<"2 to deleteFromEnd "<<endl;
        cout<<"3 to seprate list into evenOdd"<<endl;
        cout<<"4 to print original List"<<endl;
        cout<<"5 to print even list"<<endl;
        cout<<"6 to print odd list"<<endl;
        cout<<"7 to Exit"<<endl;
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
            SeprateList();
            break;
            case 4:
            display();
            break;
            case 5:
            evenDisplay();
            break;
            case 6:
            oddDisplay();
            break;
            case 7:
            cout<<"Ending the program "<<endl;
            break;
            default:
            cout<<"Enter a valid number "<<endl;
        }

    }while(number!=7);

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
    void evenDisplay(){
        if(Evenfirst==NULL){
            cout<<"list is empty"<<endl;
        }else{
            Node *Temp=Evenfirst;
            while(Temp!=NULL){
                cout<<"ID : "<<Temp->id<<" Name : "<<Temp->Name<<endl;
                Temp=Temp->next;
            }
            }
        }
void oddDisplay(){
            if(ODDfirst==NULL){
                cout<<"list is empty"<<endl;
            }else{
                Node *Temp=ODDfirst;
                while(Temp!=NULL){
                    cout<<"ID : "<<Temp->id<<" Name : "<<Temp->Name<<endl;
                    Temp=Temp->next;
                }
                }
            }            
void SeprateList(){
    if(first==NULL){
        cout<<"Linked list is empty"<<endl;
    }
    else{
        Node *Temp=first;
    while(Temp!=NULL){
        curr=new Node(Temp->id,Temp->Name);
        if(Temp->id%2==0){
            if(Evenfirst==NULL){
                Evenfirst=Evenlast=curr;
            }else{
                Evenlast->next=curr;
                Evenlast=curr;
                Evenlast->next=NULL;
            }

        }else{
            if(ODDfirst==NULL){
                ODDlast=ODDfirst=curr;
            }else{
                ODDlast->next=curr;
                ODDlast=curr;
                ODDlast->next=NULL;
            }

        }Temp=Temp->next;
    }}
}    
