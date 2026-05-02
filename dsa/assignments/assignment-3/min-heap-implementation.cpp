#include <iostream>
using namespace std;
struct HeapPriority{
    int distance;
    int node;
};
struct MinHeap{
    HeapPriority H[50];
	int size = -1;
   void shiftUp(int i) {
	    while (i > 0) {
	        int p = (i - 1) / 2;
	        if (H[p].distance > H[i].distance) {
	            swap(H[p], H[i]);
	            i = p;
	        } else {
	            break;
	        }
	    }
	}
	
	void push(int d, int n) {
		HeapPriority p;
        p.distance=d;
        p.node=n;
	    size++;
	    H[size] = p;
	    shiftUp(size);
	}
	
	void shiftDown(int i) {
	    int j = 2 * i + 1;
	    while (j <= size) {
	        if (j + 1 <= size) {
	        	if( H[j + 1].distance < H[j].distance ){
	            	j = j + 1;
				}
	        }
	
	        if (H[i].distance > H[j].distance ) {
	            swap(H[i], H[j]);
	            i = j;
	            j = 2 * i + 1;
	        } else {
	            break;
	        }
	    }
	}
	
	HeapPriority pop() {
	    HeapPriority result = H[0];
	    H[0] = H[size];
	    size--;
	    shiftDown(0);
	    return result;
	}
};
void MinSpanningTree(int Arr[8][8],int vertex,int src){
    if(src>=vertex){
        cout<<"Invalid source"<<endl;
        return;
    }

    bool visited[vertex] {false};
    int result[2][vertex];
      for (int i = 0; i < vertex; i++) {
        result[1][i] = INT_MAX; 
        result[0][i] = -1;     
    }
    MinHeap h;
    for (int i=0;i<vertex;i++){
        if(Arr[src][i]!=INT_MAX){
            result[1][i]=Arr[src][i];
            result[0][i]=src;
            h.push(Arr[src][i],i);

        }
        
    }
     visited[src]=true;
    result[1][src]=0;
    result[0][src]=src;
    while(h.size>=0){
        HeapPriority h1=h.pop();
        int distance=h1.distance;
        int node=h1.node;
        if(visited[node]==false){
        visited[node]=true;
        for(int i=0;i<vertex;i++){
            if(visited[i]!=true && Arr[node][i]!=INT_MAX && result[1][i]>Arr[node][i]){
                result[1][i]=Arr[node][i];
                result[0][i]=node;
                h.push(Arr[node][i],i);
            }
        }
    }

}
  int sum = 0;
    cout << "Edges in MST:\n";
    for (int i = 0; i < vertex; i++) {
       // if (result[1][i] != INT_MAX )
            cout << result[0][i] << " - " << i << " with weight " << result[1][i] << endl;
            sum += result[1][i];
    
    }
     cout << "Sum of weights: " << sum << endl;

}
int main(){
     int size=8;
    int matrix[8][8]={
        {INT_MAX,8,INT_MAX,INT_MAX,INT_MAX,10,INT_MAX,4},
        {8,INT_MAX,4,INT_MAX,10,7,INT_MAX,9},
        {INT_MAX,4,INT_MAX,3,INT_MAX,3,INT_MAX,INT_MAX},
        {INT_MAX,INT_MAX,3,INT_MAX,25,18,2,INT_MAX},
        {INT_MAX,10,INT_MAX,25,INT_MAX,2,7,INT_MAX},
        {10,7,3,18,2,INT_MAX,INT_MAX,INT_MAX},
        {INT_MAX,INT_MAX,INT_MAX,2,7,INT_MAX,INT_MAX,3},
        {4,9,INT_MAX,INT_MAX,INT_MAX,INT_MAX,3,INT_MAX}


    };
    MinSpanningTree(matrix,size,0);
    

    return 0;
}
