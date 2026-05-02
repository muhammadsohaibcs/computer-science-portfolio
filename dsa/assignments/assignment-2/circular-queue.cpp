# include <iostream>
# include <stack>
using namespace std;
class CircularQueue{
    int* arr;
    int c;
    int f ,r;
    public:
    CircularQueue(int value){
        c= value;
        arr = new int [value];
        f=-1;
        r=-1;
        arr1 = new int [5];
        arr2 = new int [5];
    }
    void Enqueue(int v){
        if ((r+1) % c == f){
            cout << "Queue is full";
            return;
        }
        else if (r==-1){
            r=f=0;
        }
        else{
            r= (r+1)% c;
        }
        arr[r]=v;
    }
    void Dequeue(){
        if (r==-1){
            cout << "Queue is Empty";
            return;
        }
        else if (r==f){
            r=f=-1;
        }
        else{
            f= (f+1)% c;
        }
    }
    void reverse(){
        stack<int> s1 ;
        if (f>r){
            for (int i = f ; i < c ; i++ ){
                s1.push(arr[i]) ;
            }
            for (int i = 0 ; i <= r ; i++ ){
                s1.push(arr[i]);
            }
        }
        else{
            for (int i = f ; i <= r ; i++ ){
                s1.push(arr[i]);
            }
        }
        int i=0;
        while(!s1.empty()){
            arr[i++]=s1.top();
            s1.pop();

        }
        f=0;
        r=--i;
    }
    void display(){
        if (r==-1){
            cout <<"Array is Empty";
            return;
        }
        int i=f;
        while (true){
            cout<<arr[i] << " ";
            if (i == r)
                break;
            i= (i+1)%c;
        }
        cout<<endl;
    }
    void split(){
            if (f == -1) {
                cout << "Queue is empty.\n";
                return;
            }
    
            CircularQueue CQueue1(c);  
            CircularQueue CQueue2(c);  
    
            int pos = 1; 
            int i = f;
            while (true) {
                if (pos % 2 == 1) {
                    CQueue1.Enqueue(arr[i]);  
                }
                else {
                    CQueue2.Enqueue(arr[i]);  
                }
    
                if (i == r) break;  
                i = (i + 1) % c; 
                pos++;
            }
            cout << "CQueue1 (Odd positions): ";
            CQueue1.display();
    
            cout << "CQueue2 (Even positions): ";
            CQueue2.display();
    }
        
};
int main(){
    CircularQueue cq = CircularQueue(4);
    cq.Enqueue(1);
    cq.Enqueue(2);
    cq.Dequeue();
    cq.Enqueue(3);
    cq.Enqueue(4);
    cq.Enqueue(5);
    cq.Dequeue();
    cq.reverse();
    
    cq.Enqueue(67);
    cq.split();
    cq.display();
    
    
    return 0;
}