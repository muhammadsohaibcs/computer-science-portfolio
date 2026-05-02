#include <iostream>
using namespace std;
class Array{
    private:
    int SI =-1;
    int LI =-1;
    int size = 5;
    int arr[5]={0};
    public :
    void insertAtEnd(){
        if ( LI==size-1 && SI == 0){
            cout<< "Array is full\n";
            return;
        }
        int value;
        cout << "Enter value to insert ";
        cin>>value;
        if (SI==-1 && LI ==-1){
            SI++;
            LI++;
            arr[SI]= value;
        }
        else if (SI>0 && LI<size-1){
            for (int i = SI; i <=LI; i++){
                arr[i-1]= arr[i];
            }
            arr[LI]=value;
            SI--;
        }

        else if (SI==0 && LI < size-1){
            arr[++LI] =value;
        }
    }
    void insertAtStart(){
        if ( LI==size-1 && SI == 0){
            cout<< "Array is full\n";
            return;
        }
        int value;
        cout << "Enter value to insert ";
        cin>>value;
        if (SI==-1 && LI ==-1){
            SI++;
            LI++;
            arr[LI] = value;
        }
        else if (SI==0 && LI < size-1){
            for (int i = LI; i >=0; i--){
                arr[i+1]= arr[i];
            }
            arr[0]=value;
            LI++;
            
        }
        else if (SI>0 && LI < size-1){
            arr[SI-1]=value;
            SI--;
        }
    }
    void insertBeforeSpecific(){
        int search;
        int flag = 0;
        int index;
        cout <<"Enter the value that you are searching for ";
        cin>>search;
        for (int i = SI; i <= LI; i++)
        {
           if (arr[i]== search){
            flag=1;
            index=i;
            break;
           }
        }
        int value;
        cout << "Enter value to insert ";
        cin>>value;
        if (flag==1){
            if ( LI==size-1 && SI == 0){
                cout<< "Array is full\n";
                return;
            }
            else if (SI>0 ){
                for (int i = SI; i <index; i++){
                    arr[i-1]= arr[i];
                }
                arr[index-1]=value;
                SI--;
            }
            else if (SI==0 && LI < size-1){
                for (int i = LI; i >=index; i--){
                    arr[i+1]= arr[i];
                }
                arr[index]=value;
                LI++;  
            }
        }else{
            cout<< "Value not found";
        }  
    }
    void insertAfterSpecific(){
        int search;
        int flag = 0;
        int index;
        cout <<"Enter the value that you are searching for ";
        cin>>search;
        for (int i = SI; i <= LI; i++)
        {
            if (arr[i]== search){
                flag=1;
                index=i;
                break;
               };
        }
        int value;
        cout << "Enter value to insert ";
        cin>>value;
        if (flag==1){
            if ( LI==size-1 && SI == 0){
                cout<< "Array is full\n";
                return;
            }
            else if (SI>0 ){
                for (int i = SI; i <index; i++){
                    arr[i-1]= arr[i];
                }
                arr[index]=value;
                SI--;
            }
            else if (SI==0 && LI < size-1){
                for (int i = LI; i >index; i--){
                    arr[i+1]= arr[i];
                }
                arr[index+1]=value;
                LI++; 
            }
        }else{
            cout<< "Value not found";
        }  
    }
    void deleteAtEnd(){
        if ( LI==-1 && SI == -1)
            cout<< "Array is Empty\n";
            else if (SI==LI){
                SI=-1;
                LI=-1;
                cout << "Array is Empty\n";
            }
        else
            LI--;
    }
    void deleteAtStart(){
        if ( LI==-1 && SI == -1)
            cout<< "Array is Empty\n";
        else if (SI==LI){
            SI=-1;
            LI=-1;
            cout << "Array is Empty\n";
        }
        else
            SI++;
    }
    void deleteBeforeSpecific(){
        int search;
        int flag = 0;
        int index;
        cout <<"Enter the value that you are searching for ";
        cin>>search;
        for (int i = SI; i <= LI; i++)
        {
            if (arr[i]== search){
                flag=1;
                index=i;
                break;
               }
        }
        if (flag==1){
            if ( LI==-1 && SI == -1){
            cout<< "Array is Empty\n";
                return;
            }
            
            else{
                for (int i = index; i <=LI; i++){
                    arr[i-1]= arr[i];
                }
                LI--;
            }
        }else{
            cout<< "Value not found";
        }
    }
    void deleteAfterSpecific(){
        int search;
        int flag = 0;
        int index;
        cout <<"Enter the value that you are searching for ";
        cin>>search;
        for (int i = SI; i <= LI; i++)
        {
            if (arr[i]== search){
                if(i==LI){
                    cout<<"Value is at last index .SO no element for deletion \n";
                    return;   
                }             
                flag=1;
                index=i;
                break;
               }
        }
        if (flag==1){
            if ( LI==-1 && SI == -1){
            cout<< "Array is Empty\n";
                return;
        }
        else{
            for (int i = index+2; i <=LI; i++){
                arr[i-1]= arr[i];
            }
            LI--;
        }
        }else{
            cout<< "Value not found";
        }
    }
    void display(){
        if (SI==-1 && LI ==-1){
            cout<< "Array is Empty";
        }
        else{
            for (int i = SI; i <= LI; i++)
        {
            cout << arr[i]<< " ";
        }
        cout<<endl;
        }   
    }
};
int main(){
    int num ;
    Array a1;
    do{
        cout<< " press 1 for Insert at end \n";
        cout<< " press 2 for Insert at start\n";
        cout<< " press 3 for Insert before specific\n";
        cout<< " press 4 for Insert after specific\n";
        cout<< " press 5 for Delete from End\n";
        cout<< " press 6 for Delete at start\n";
        cout<< " press 7 for Delete before specific\n";
        cout<< " press 8 for Delete  after specific\n";
        cout<< " press 9 for Display\n";
        cout << "Press 10 for exit\n";
        cout << "Enter the num \n";
        cin >> num;
        if (num==1)
            a1.insertAtEnd();
        else if (num==2)
            a1.insertAtStart();
        else if (num==3)
            a1.insertBeforeSpecific();
        else if (num==4)
            a1.insertAfterSpecific();
        else if (num==5)
            a1.deleteAtEnd();
        else if (num==6)
            a1.deleteAtStart();
        else if (num==7)
            a1.deleteBeforeSpecific();
        else if (num==8)
            a1.deleteAfterSpecific();
        else if (num==9)
            a1.display();
        
    } while (num!=10);
    cout<<"*********************You Exit Successfully*********************";
    return 0;
}



