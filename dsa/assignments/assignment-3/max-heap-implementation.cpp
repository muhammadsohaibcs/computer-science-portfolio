# include <iostream>
using namespace std;

struct pqHeap {
    int dist;
    int node; 
};

struct Heap{
	pqHeap H[50];
	int size = -1;
	
	void shiftUp(int i) {
	    while (i > 0) {
	        int p = (i - 1) / 2;
	        if (H[p].dist > H[i].dist || ( H[p].dist == H[i].dist && H[p].node > H[i].node )) {
	            swap(H[p], H[i]);
	            i = p;
	        } else {
	            break;
	        }
	    }
	}
	
	void push(int d, int n) {
		pqHeap p;
		p.dist = d;
		p.node = n;
	    size++;
	    H[size] = p;
	    shiftUp(size);
	}
	
	void shiftDown(int i) {
	    int j = 2 * i + 1;
	    while (j <= size) {
	        if (j + 1 <= size) {
	        	if( H[j + 1].dist < H[j].dist || ( H[j + 1].dist == H[j].dist && H[j + 1].node < H[j].node ) ){
	            	j = j + 1;
				}
	        }
	
	        if (H[i].dist > H[j].dist || ( H[i].dist == H[j].dist && H[i].node > H[j].node )) {
	            swap(H[i], H[j]);
	            i = j;
	            j = 2 * i + 1;
	        } else {
	            break;
	        }
	    }
	}
	
	pqHeap pop() {
	    pqHeap result = H[0];
	    H[0] = H[size];
	    size--;
	    shiftDown(0);
	    return result;
	}
};

void dijkstra(int n, int roads[8][8], int size){
	int x=n;
	Heap h;
	int d = 0;
    bool visited[size] {false};
	
	int dist[size];
    for (int i=0;i<size;i++){
        dist[i]=INT_MAX;
    }

	dist[n] = 0;
	
	h.push(d,n);
	
	while(h.size >= 0){
		pqHeap pq = h.pop();
		n = pq.node;
		d = pq.dist;
        if(visited[n]==false){
            visited[n]=true;
		
		for(int j = 0; j < size; j++){
			if (roads[n][j] != INT_MAX && roads[n][j] + d < dist[j]) {
             dist[j] = roads[n][j] + d;
                h.push(dist[j], j);
                 }

		}
        }
	}
	
	for(int i = 0; i < size; i++){
		cout<<x<<"->"<<i<<" : " << dist[i] << endl ;
	}
	cout << endl;
	
}

void display(int roads[8][8]){
	for(int i = 0; i < 8; i++){
		for(int j = 0; j < 8; j++){
			cout << roads[i][j] << " ";
		}
		cout << endl;
	}
	cout << endl;
}

int main(){
	int size = 8;
	int roads[8][8] = {
        {INT_MAX, 7, 10,INT_MAX, INT_MAX,INT_MAX,INT_MAX,35},
        {7,INT_MAX,2,8,INT_MAX,INT_MAX,INT_MAX,INT_MAX},
        {10,2,INT_MAX,INT_MAX,4,INT_MAX,INT_MAX,INT_MAX},
        {INT_MAX,8,INT_MAX,INT_MAX,3,4,INT_MAX,INT_MAX},
		{INT_MAX,INT_MAX,4,3,INT_MAX,1,9,INT_MAX},
		{INT_MAX,INT_MAX,INT_MAX,4,1,INT_MAX,1,8},
		{INT_MAX,INT_MAX,INT_MAX,INT_MAX,9,1,INT_MAX,2},
		{35,INT_MAX,INT_MAX,INT_MAX,INT_MAX,8,2,INT_MAX},
    };
    dijkstra(0, roads, size);
    
    return 0;
}
