# include <iostream>
using namespace std;
class Node {
    public:
    int data =0;
    Node * next = NULL;
        Node(int data){
            this->data = data;
        };
        Node(){
        };          
};

class circular{
    public:
    Node * last = NULL;
    void insertAtEnd(int value){
        Node * curr = new Node(value);
        if (last==NULL){
            last = curr;
            last->next = curr;
        }else{
            curr -> next = last->next;
            last ->next = curr;
            last = curr;
        }
    }
    void insertAtStart(int value){
        Node * curr = new Node(value);
        if (last==NULL){
            last = curr;
            last->next = curr;
        }else{
            curr -> next = last->next;
            last ->next = curr;
        }
    }
    void evenRemove(){
        if (last== NULL)
            cout<<"Empty";
        else{
            Node* prev = last;
            Node* curr= last->next;
            while(curr!=last){
                if (curr->data %2==0){
                        prev ->next = prev->next->next;
                        curr = prev ->next;
                }
                else{
                    prev = curr;
                    curr = curr -> next;
                }
            }
            if (curr->data %2==0){
            prev ->next = prev->next->next;
            if(prev->data%2==0)
                last = NULL;
            else
                last = prev;}
        }
    }
    void oddRemove(){
        if (last== NULL)
            cout<<"Empty";
        else{
            Node* prev = last;
            Node* curr= last->next;
            while(curr!=last){
                if (curr->data %2!=0){
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
    void oddindexes(){
        if (last== NULL)
            cout<<"Empty";
        else{
            Node* prev = last;
            Node* curr= last->next;
            int count =1;
            while(curr!=last){
                if (count %2==0){
                        prev ->next = prev->next->next;
                        curr = prev ->next;
                }
                else{
                    prev = curr;
                    curr = curr -> next;
                }
                count++;
            }
            if (count%2==0){
            prev ->next = prev->next->next;
            last = prev;}
        }
    }
    void evenindexes(){
        if (last== NULL)
            cout<<"Empty";
        else{
            Node* prev = last;
            Node* curr= last->next;
            int count =1;
            while(curr!=last){
                if (count %2!=0){
                        prev ->next = prev->next->next;
                        curr = prev ->next;
                }
                else{
                    prev = curr;
                    curr = curr -> next;
                }
                count++;
            }
            if (count%2!=0){
            prev ->next = prev->next->next;
            last = prev;}
        }
    }
    void display(){
        if(last==NULL){
            cout<<"List is Empty";
            return;
        }
		Node* temp = last->next;
		while(temp!=last){
			cout<<temp -> data<<" ";
			temp = temp ->next;
		}
		cout<<temp -> data<< endl;
	}
};
int main(){
    circular list;
    int number;
    do{
	cout<<"1 : Insert At End"<<endl;
	cout<<"2 : Insert At Start"<<endl;
	cout<<"3 : To delete the Even values in Linked List"<<endl;
	cout<<"4 : To delete the ood values in Linked List"<<endl;
	cout<<"5 : To delete the Even indexes in Linked List"<<endl;
	cout<<"6 : To delete the odd indexes in Linked List"<<endl;
    cout<<"7 : To Display"<<endl;
    cout<<"8 : To Exit"<<endl;
    cin>>number;
    if (number==1){
        int a;
        cout <<"Enter the value to insert at end : ";
        cin >>a;
        list.insertAtEnd(a);
    }
        
    if (number==2){
        int a;
        cout <<"Enter the value to insert at start : ";
        cin >>a;
        list.insertAtStart(a);
    }
    if (number==3)
        list.evenRemove();
    if (number==4)
        list.oddRemove();
    if (number==5)
        list.oddindexes();
    if (number==6)
        list.evenindexes();
    if (number==7)
        list.display();
    }
    while(number!=8);
        cout<<"**********You exit successfully*************";
}
