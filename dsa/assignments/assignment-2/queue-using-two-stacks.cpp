#include<iostream>
using namespace std;


class TwoQueue{
    int* arr;
    int f1 , f2, r1,r2,c;
    public:
    TwoQueue(int c){
        this->c=c;
        arr = new int [c];
        f1=r1=-1;
        f2=r2=c;
    }
    void enqueue1(int value){
        if (r1+1==r2){
            cout<<"Queue Overflows \n";
            return;
        }
        else if (r1+1==r2 && f1!=0){
            for (int i =f2 ; i> r2 ; i--)
                arr[i] = arr[i+1];
        }
        else if (f1==-1){
            f1=0;
            r1=0;
        }
        else{
            r1++;
        }
        arr[r1]= value;

    }
    void dequeue1(){
        if (r1==-1 && f1==-1){
            cout<<"Queue is Already Empty\n";
        }
        else if (f1== r1 ){
           f1 = -1;
           r1 =-1;
        }
        else{
            f1++;
        }
    }
    void display1(){
        if (r1==-1){
            cout<<"Queue is Empty\n";
            return;
        }
        for (int i =f1 ; i<= r1 ; i++){
            cout <<arr[i]<<" ";
        }
        cout<<endl;
    }
    void enqueue2(int value){
        if (r2-1==r1 && (f2==c-1 || f2==c) ){
            cout<<"Queue Overflows\n";
        }
        else if (r2-1==r1 && f2!=c-1){
            for (int i =f2 ; i> r2 ; i--)
                arr[i] = arr[i+1];
        }
        else if (f2==c){
            f2=c-1;
            r2=c-1;
        }
        else{
            r2--;
        }
        arr[r2]= value;

    }
    void dequeue2(){
        if (r2==c && f2==c){
            cout<<"Queue is Already Empty\n";
        }
        else if (r2 == f2){
           f2= c;
           r2 =c;
        }
        else{
            f2++;
        }
    }
    void display2(){
        if (r2==c){
            cout<<"Queue is Empty\n";
            return;
        }
        for (int i =f2 ; i>= r2 ; i--){
            cout<< arr[i] <<" ";
        }
        cout<<endl;
    }
};
int main() {
    TwoQueue s1 = TwoQueue(10);
    s1.enqueue1(9);
    s1.enqueue2(5);
    s1.enqueue1(3);
    s1.dequeue2();
    s1.display1();
    s1.display2();
    
}