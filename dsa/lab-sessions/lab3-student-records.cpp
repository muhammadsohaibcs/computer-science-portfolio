# include <iostream>
#include <vector>
using namespace std;
struct Node{
		int marks;
		Node*  next=NULL;
};

class LinkedList{
			
		public:
		Node * first = NULL;
		Node * last = NULL;
		void insertAtEnd(){
			Node * curr = new Node;
			int  value;
			cout<<"Enter your marks ";
			cin >> value;
			curr->marks = value;
			if (first==NULL){
				first=curr;
				last=curr;	
			}
			else{
				last ->next = curr;
				last = curr;
				last -> next =NULL;
			}
		}
		void insertAtStart(){
			Node * curr = new Node;
			int  value;
			cout<<"Enter your marks ";
			cin >> value;
			curr->marks = value;
			if (first==NULL){
				first=curr;
				last=curr;	
			}
			else{
				curr -> next = first;
				first = curr;
			}
		}
		Node *  search(int a){
			Node*  temp1 =first;
			if (first==NULL){
				cout << "List is Empty\n";
			}
			int  key;
			cout<<"Enter the value that you want to search ";
			cin >> key;
			if (a==0){
				while (temp1 != NULL && temp1 -> marks != key )
					temp1 = temp1 ->next;
			}
			else if (a==1){
				if (temp1->marks ==key){
					temp1 = first;
				}
				else{
					while (temp1->next != NULL && temp1 -> next -> marks != key ){
						temp1 = temp1 ->next;
					}
				}
			}
			return temp1;
		}
		Node *  searchForMerge(int a){
				Node * temp1 = first;
				if (temp1->marks <a){
					temp1 = first;
				}
				else{
					while (temp1->next != NULL && temp1 -> next -> marks < a ){
						temp1 = temp1 ->next;
					}
				}
			return temp1;
		}
		void insertAfterSpecific(){
			Node* temp1 = search(0);
			if (temp1 ==NULL){
				cout << "Element not found";
				return;
			}
			Node * curr = new Node;
			int  value;
			cout<<"Enter your marks ";
			cin >> value;
			curr->marks = value;
			if (temp1 ==last){
				temp1 ->next = curr;
				last = curr;
			}
			else{
				curr ->next = temp1 ->next;
				temp1 ->next = curr;
			}
		}
		void insertBeforeSpecific(){
			Node* temp1 = search(1);
			if (temp1 ==NULL){
				cout << "Element not found";
				return;
			}
			Node * curr = new Node;
			int  value;
			cout<<"Enter your marks ";
			cin >> value;
			curr->marks = value;
			if (temp1 == first){
				curr ->next = first;
				first= curr;
			}
			else{
				curr ->next = temp1 ->next;
				temp1 ->next = curr;
			}
		}
		void deleteAtStart(){
			if (first==NULL && last == NULL){
				cout << "List is Empty";
			}
			if (first == last ){
				first = NULL;
				last = NULL;
			}
			else{
				Node * q = first;
				first = first ->next;
				delete q;
			}
		}
		void deleteAtEnd(){
			if (first==NULL && last == NULL){
				cout << "List is Empty";
			}
			if (first == last ){
				first = NULL;
				last = NULL;
			}
			else{
				Node * q = last;
				Node * temp1 = first;
				while (temp1->next != NULL ){
					temp1 = temp1 ->next;
				}
				last = temp1;
				last ->next=NULL;
				delete q;
			}
		}
		void deleteAfterSpecific(){
			Node* temp1 = search(0);
			cout << temp1;
			if (temp1 ==NULL){
				cout << "Element not found";
			}
			else if (temp1 ==last ){
				cout << "There is no element after this";
			}
			else{
				temp1->next = temp1->next->next;
			}
		}
		void deleteBeforeSpecific(){
			Node* temp1 = search(1);
			if (temp1 ==NULL){
				cout << "Element not found";
				return;
			}
			else if (temp1 == first && temp1 ==last){
				first = NULL;
				last = NULL;
			}
			else if (temp1 == first){
				delete first;
				first =temp1 ->next;
			}
			else if (temp1 ->next == last){
				delete temp1 ->next;
				last =temp1;
			}
			else{
				Node * q = temp1->next;
				temp1->next = temp1->next->next;
				delete q;
			}
			
		}
		void deleteAtSpecific (){
			Node* temp1 = search(0);
			if (temp1 ==NULL){
				cout << "Element not found";
				return;
			}
			else if (temp1 == first && temp1 ==last){
				first = NULL;
				last = NULL;
			}
			else if (temp1 == first){
				delete first;
				first =temp1 ->next;
			}
			else if (temp1 ->next == last){
				delete temp1 ->next;
				last =temp1;
			}
			else{
				Node * q = temp1->next;
				temp1->next== temp1->next->next;
				delete q;
			}
			
		}
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
		
		void deleteList(){
			while (first!= NULL){
				Node * q = first;
				first = first ->next ;
				delete q;
			}
		}
		void multiple(){
			Node * temp1 = first;
			if (temp1 == NULL || temp1->next == NULL){
				cout << "No element found";
				return;
			}
			vector<int > a;
			while (temp1 != NULL){
				if (a.empty()){
					cout << temp1 -> marks;
					a.push_back(temp1 ->marks);
				}
				int i =0;
				for ( i ; i < a.size(); i++)
				{
					if (a[i] == temp1 -> marks)
					break;	
				}
				if (i == a.size()){
					cout << temp1 -> marks;
					a.push_back(temp1 ->marks);
				}
			temp1 = temp1 ->next;
		}
		cout<< endl;
	}
	void display(){
		Node* temp = first;
		while(temp!=NULL){
			cout<<temp -> marks<<" ";
			temp = temp ->next;
		}
		cout<< endl;
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
	Node* searchForSwap(int key){
		Node* temp = first;
		while(temp->next!=NULL && temp->next->marks != key){
			temp= temp ->next;
		}
		return temp;

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
    
	// void swap(){
	// 	int key1;
	//  	cin >> key1;
	// 	Node* n1 = searchForSwap(key1);
	// 	int key2;
	//  	cin >> key2;
	// 	Node* n2 = searchForSwap(key2);
	// 	if (key1==key2){
	// 		cout<<"Both are same";
	// 	}
	// 	else if (n1=NULL)
	// 		cout << "Element 1 not found";
	// 	else if (n1=NULL)
	// 		cout << "Element 2 not found";
	// 	else if (first->marks == key1 || first->marks==key2){
	// 		if (n1->next ==last || n2 ->next == last){
	// 			Node * temp1 = first ->next;
	// 			first ->next = NULL;
	// 			if (n1->next==last){
	// 				n1-> next = first;
	// 				first->next = NULL;
	// 			}
	// 			else if (n2->next==last){
	// 				n2-> next = first;
	// 				first->next = NULL;
	// 			}
	// 			last -> next = temp1;
	// 			first = last;
	// 		}
			
	// 		else if (first->marks == key2){
	// 			first = n1 ->next;
	// 			first ->next = n2 ->next;
	// 			n1 ->next = n1 ->next->next;
	// 			n1 -> next = n2;
	// 		}
	// 		else if (first->marks == key1){
	// 			first = n2 ->next;
	// 			first ->next = n1 ->next;
	// 			n2 ->next = n2 ->next->next;
	// 			n2 -> next = n1;
	// 		}
	// 	}
	// 	else if (n1 ->next==last){
	// 		Node* temp1 = n2 -> next;
	// 		Node * temp2 = n2 -> next ->next;
	// 		n2 ->next = last;
	// 		n2 ->next ->next = temp2;
	// 		n1->next = temp1;
	// 		last = temp1;
	// 		last -> next = NULL;
	// 	}
	// 	else if (n2 ->next==last){
	// 		Node* temp1 = n1 -> next;
	// 		Node * temp2 = n1 -> next ->next;
	// 		n1 ->next = last;
	// 		n1 ->next ->next = temp2;
	// 		n2->next = temp1;
	// 		last = temp1;
	// 		last -> next = NULL;
	// 	}
	// 	else{
	// 		Node* temp1 = n1 -> next;
	// 		Node * temp2 = n2 -> next;
	// 		n1 ->next ->next = temp2;
	// 		n2->next = temp1;
	// 		n2 -> next-> next = temp2 ->next ;
	// 	}
	// }
	
};
LinkedList* merge(LinkedList* l1 , LinkedList* l2){
	if (l1==NULL){
		return l2;
	}
	if (l2==NULL){
		return l1;
	}
	else{
	l1->last->next =l2 ->first;
	l1->last = l2 ->last;
	return l1;
	}
};
// LinkedList* sortedmerge(LinkedList* l1 , LinkedList* l2){
// 	if (l1==NULL){
// 		return l2;
// 	}
// 	if (l2==NULL){
// 		return l1;
// 	}
// 	else{
// 		Node *temp2=l2-> first;
// 		Node *temp3 = temp2;
// 		while (temp3!=NULL){
// 			Node *temp1 = l1->searchForMerge(temp2 ->marks);
// 			if (temp1 == l1->first){
// 				temp2 ->next = temp1;
// 				l1->first = temp2;
// 			}
// 			else{
// 				temp2 ->next = temp1 ->next;
// 				temp1 ->next = temp2;
// 			}
// 			temp3 = temp3->next;
// 		}
// 	}
// 	return l1;
// };
int main(){
	int number;
	LinkedList a;
	do{
	cout<<"1 : Insert At End"<<endl;
	cout<<"2 : Insert At Start"<<endl;
	cout<<"3 : Insert Before Specefic"<<endl;
	cout<<"4 : Insert After Specefic"<<endl;
	cout<<"5 : Delete From End"<<endl;
	cout<<"6 : Delete From Start"<<endl;
	cout<<"7 : Delete Before Specefic"<<endl;
	cout<<"8 : Delete After Specefic"<<endl;
	cout<<"9 : Delete at Specific"<<endl;
	cout<<"10 : Reverse print"<<endl;
	cout<<"11 : Merge two lists"<<endl;
	cout<<"12 : Multiple elements"<<endl;
	cout<<"13 : Display"<<endl;
	cout<<"14 : Delete the list"<<endl;
	cout<<"15 : Exit"<<endl;
	cout<<"Enter what you want to do"<<endl;
	cin>>number;
	int n =1;
	switch(number){
		case 1:
			a.insertAtEnd();
			break;
		case 2:
		    a.swap();
		    break;
		case 3:
		  a.insertBeforeSpecific();
		    break;
		case 4:
		    a.insertAfterSpecific();
		    break;
		case 5:
		    a.deleteAtEnd();
		    break;
		case 6:
			a.deleteAtStart();
		    break;
		case 7:
			a.deleteBeforeSpecific();
		    break;
		case 8:
			a.deleteAfterSpecific();
		    break;
		case 9:
		    a.deleteAtSpecific();
			break;
		case 10:{
			cout << "for using loop press 1 \n for recursion press any number except 1\n ";
			int v ;
			cin >>v;
			if (v==1)
				a.reverseLoop();
			else
				a.reverseC();
			break;
		}
		case 11:
		{
			// int g ;
			// cout << "press 1 for simple merge \n Press any other number for sorted merge and Remember Enter the first List sorted for this merge \n";
			// cin >> g;
				LinkedList  b ;
				LinkedList c ;
				cout << "Enter first Linked List";
				do{
					b.insertAtEnd ();
					cout << "Press 0 to exit & press any number to continue\n";
					cin>>n;
				}
				while (n!=0);
				cout << "Enter second Linked List\n";
				do{
					c.insertAtEnd ();
					cout << "Press 0 to exit & press any number to continue\n";
					cin>>n;
				}while (n!=0);
  				LinkedList* m;
				  m= merge(&b, &c);
				// if (g==1)
				// else 
				// 	m = sortedmerge(&b,&c);
				m->display();
				break;
		}			    
		case 12:
			a.multiple();
			break;
		case 13:
			a.display();
			break;
			case 14:
		a.deleteList();
			break;
		case 15:
		    cout<<"Ending the program"<<endl;
			break;
		default:
		    cout<<"Invalid choice"<<endl;
		}		   	
	}while(number!=15);
	return 0;
}
