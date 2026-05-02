#include <iostream>
using namespace std;

struct Patient {
    string Condition;
    string Name;
    string problem;
    Patient(string a,string b,string c){
        this->Name=a;
        this->Condition=b;
        this->problem=c;
    }
    Patient(){

    }


};

Patient H[50];
int heapSize=-1;



int parent(int x){
    return (x-1)/2;
}
int Priority(string x){
    if(x=="Critical"){
        return 1;
    }else if(x=="Serious"){
        return 2;
    }else{
        return 3;
    }
}

void shiftUp(int x){
    Patient temp=H[x];
    while (x>0 && Priority(H[parent(x)].Condition) >Priority(H[x].Condition)){
        H[x]=H[parent(x)];
        x=parent(x);
    }
    H[x]=temp;
}

void shiftDown(int x){
    int j=(x*2)+1;
    while(x<=heapSize){
        if(j<=heapSize && Priority(H[j+1].Condition)<Priority(H[j].Condition)){
            j=j+1;
        }
        if(Priority(H[x].Condition)>Priority(H[j].Condition)){
            Patient temp=H[x];
            H[x]=H[j];
            H[j]=temp;
            x=j;
            j=j*2+1;
        }else{
            break;
        }
        
    }
}
void insert(Patient x){
    heapSize=heapSize+1;
    H[heapSize]=x;
    shiftUp(heapSize);

}
Patient Delete(){
      if (heapSize < 0) {
        cout << "Heap is empty!" << endl;
        return Patient();
    }

    Patient root=H[0];
    H[0]=H[heapSize];
    heapSize=heapSize-1;
    shiftDown(0);

    return root;

}
void Display(){
    if(heapSize<0){
        cout<<"Heap is Empty"<<endl;
        return;
    }
    for(int i=0;i<=heapSize;i++){
        cout<<"Name "<<H[i].Name <<" Condition "<<H[i].Condition<<" problem "<<H[i].problem<<endl;
    }

}

int main() {
    Patient first("Sohaib","Stable","Sleeping");
    Patient second("Yousaf","Serious","Blood Pressure");
    Patient Third("Ramzan","Critical","Kidney pain");
    Patient Fourth("Hamza","Critical","Liver pain");

    insert(first);
    insert(second);
    insert(Third);
    insert(Fourth);
    Display();
    return 0;
}