#include <iostream>
using namespace std;

struct ArrayList{
    int size = 0;
    int lastIndex = 10;
    int* data = new int [lastIndex];
    void add (int value){
        if (isFull()){
            resize();
        }
        else{
            data[size ++]=value;
            

        }

    }
    bool isFull(){
        if (lastIndex==size){
            return true;
        }
        else{
            return false;
        }
    }
    void resize(){
        lastIndex = size*2;
        int* temp = new int [lastIndex];
        for (int i =0; i<size;i++){
            temp[i]=data[i];
        }
        delete [] data;
        data = temp;
    }
    void show(){
        for (int i = 0; i < size; i++)
    {
       cout << *(data+i)<<endl;
       
    }
    
    }
};
int main(){
    ArrayList array;
    

    array.add(9);
    array.add(1);
    array.add(2);
    array.add(3);
    array.add(4);
    array.add(5);
    array.add(9);
    array.add(1);
    array.add(2);
    array.add(3);
    array.add(4);
    array.add(5);
    array.add(1);
    array.add(2);
    array.add(3);
    array.add(4);
    array.add(5);
    array.add(9);
    array.add(1);
    array.add(2);
    array.add(3);
    array.add(4);
    array.add(5);
    array.show();
    
    
    return 0;
}