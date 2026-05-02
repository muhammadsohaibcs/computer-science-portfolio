# include <iostream>
using namespace std;
struct Node
{
    int marks;
    Node* next;
    Node* prev;
};
Node* first = NULL;
Node* last = NULL;


void swapAlternate() {
    if (first == NULL || first->next == NULL) return; 

    Node* curr1 = first;
    Node* curr2= last;

    while (curr1 != curr2  ) {
        if ( curr1->next == curr2){
            return;

        }
        

        else if ( curr1->next->next== curr2->prev){
            Node * temp1 = curr1 ->next;
            curr1 ->next = curr2 ->prev;
            Node * temp2 = curr2->prev->prev ;
            curr2 ->prev ->next = temp1 ;
            curr2 ->prev ->prev = curr1;
            temp2->next= temp1;
            temp1 ->prev = temp2;
            curr2->prev = temp1;
            temp1 ->next =curr2;
            return;

        }
       

        else {
            Node * temp1 = curr1 ->next;
            curr1 ->next = curr2 ->prev;
            Node * temp2 = curr2->prev->prev ;
            curr2 ->prev ->next = temp1 ->next;
            curr2 ->prev ->prev = curr1;
            temp2->next= temp1;
            temp1 ->prev = temp2;
            curr2->prev = temp1;
            temp1 ->next =curr2;

        }

       curr2 = curr2->prev->prev;
       curr1 = curr1 ->next->next;
        
    }
}