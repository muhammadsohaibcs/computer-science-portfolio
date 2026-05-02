#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

vector<vector<int>> graph;
vector<vector<int>> allPaths;

void bfsAllPaths(int start, int target) {
    queue<vector<int>> q;
    q.push({start});

    while (!q.empty()) {
        vector<int> path = q.front();
        q.pop();
        int last = path.back();

        if (last == target) {
            allPaths.push_back(path);
        } else {
            for (int neighbor : graph[last]) {
                if (find(path.begin(), path.end(), neighbor) == path.end()) {
                    vector<int> newPath(path);
                    newPath.push_back(neighbor);
                    q.push(newPath);
                }
            }
        }
    }

    for (const auto& path : allPaths) {
        for (int node : path) cout << node << " ";
        cout << endl;
    }
};
int main() {
    graph = {
        {1, 2},     
        {3},        
        {3},        
        {}          
    };

    bfsAllPaths(0, 3); 
    return 0;
}
