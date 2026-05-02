#include <iostream>
#include <vector>
using namespace std;

bool DFS(int vtx, int adj[][6], vector<int> &visited, vector<int> &recStack, int n) {
    visited[vtx] = 1;
    recStack[vtx] = 1;

    for (int neighbor = 0; neighbor < n; neighbor++) {
        if (adj[vtx][neighbor] == 1) { 
            if (!visited[neighbor]) {
                if (DFS(neighbor, adj, visited, recStack, n)) {
                    return true;
                }
            } else if (recStack[neighbor]) {
                return true;
            }
        }
    }

    recStack[vtx] = 0;
    return false;
}

bool isCyclic(int adj[][6], int n) {
    vector<int> visited(n, 0);
    vector<int> recStack(n, 0);

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            if (DFS(i, adj, visited, recStack, n)) {
                return true;
            }
        }
    }

    return false;
}

int main() {
    int n = 6; 

    int adj[6][6] = {
        {0, 1, 0, 0, 0, 0}, 
        {0, 0, 1, 0, 0, 0}, 
        {0, 0, 0, 1, 0, 0}, 
        {0, 1, 0, 0, 0, 0}, 
        {0, 0, 0, 0, 0, 1}, 
        {0, 0, 0, 0, 0, 0}  
    };

    if (isCyclic(adj, n)) {
        cout << "The task dependencies contain a cycle (deadlock possible)." << endl;
    } else {
        cout << "The task dependencies do not contain a cycle (no deadlock)." << endl;
    }

    return 0;
}


