#include<iostream>
using namespace std;



class TwoStack{
    int* arr;
    int f1 , f2 ,c;
    public:
    TwoStack(int c){
        this->c=c;
        arr = new int [c];
        f1=-1;
        f2=c;
    }
    
    
    void push_front1(int value){
        if (f1+1==f2){
            cout<<"Stack Overflows \n";
            return;
        }
        else if (f1==-1){
            f1=0;
        }
        else{
            f1++;
        }
        arr[f1]= value;

    }
    void pop_front1(){
        if (f1==-1 ){
            cout<<"Stack is Already Empty\n";
        }
        else{
            f1--;
        }
    }
    void display1(){
        if (f1==-1){
            cout<<"Queue is Empty\n";
            return;
        }
        for (int i =0 ; i<= f1 ; i++){
            cout <<arr[i]<<" ";
        }
        cout<<endl;
    }
    void push_front2(int value){
        if (f2-1==f1){
            cout<<"Stack Overflows \n";
            return;
        }
        else if (f2==c){
            f2=c-1;
        }
        else{
            f2--;
        }
        arr[f2]= value;

    }
    void pop_front2(){
        if (f2==c ){
            cout<<"Stack is Already Empty\n";
        }
        else{
            f2++;
        }
    }
    void display2(){
        if (f2==c){
            cout<<"Queue is Empty\n";
            return;
        }
        for (int i =c-1 ; i>= f2 ; i--){
            cout <<arr[i]<<" ";
        }
        cout<<endl;
    }
};
int main() {
    TwoStack s1 = TwoStack(200);
    s1.push_front1(9);
    s1.push_front2(5);
    s1.push_front1(3);
    s1.pop_front1();
    s1.display1();
    s1.display2();
    
}