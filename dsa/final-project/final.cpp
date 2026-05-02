#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <queue>

using namespace std;

struct City {
    int cityID;
    string cityName;
    string province;
    long long population;
    int area;
    int postalCode;
};
struct MSTEdge {
    string from;
    string to;
    int weight;
};


struct Edge {
    int toCityID;
    int weight;
};
class PriorityQueue {
private:
    vector<Edge> heap;

    int parent(int i) {
        return (i - 1) / 2;
    }

    void siftUp(int index) {
        while (index > 0 && heap[index].weight < heap[parent(index)].weight) {
            swap(heap[index], heap[parent(index)]);
            index = parent(index);
        }
    }

public:
    void push(Edge node) {
        heap.push_back(node);
        siftUp(heap.size() - 1);
    }

    void pop() {
        if (heap.empty()) {
            return;
        }

        heap[0] = heap.back();
        heap.pop_back();

        if (heap.empty()) {
            return;
        }

        int i = 0;
        int n = heap.size();
        int j = 2 * i + 1;

        while (j < n) {
            if (j < n - 1 && heap[j + 1].weight < heap[j].weight) {
                j = j + 1;
            }

            if (heap[i].weight > heap[j].weight) {
                swap(heap[i], heap[j]);
                i = j;
                j = 2 * i + 1;
            } else {
                break;
            }
        }
    }

    Edge top() {
        return heap[0];
    }

    bool empty() {
        return heap.empty();
    }
    

};

class Graph {
private:
    vector<City> cityList;
    vector<vector<Edge> > adjList;

    string getCityNameById(int cityID) {
        City* city = cityHashTable.search(cityID);
         return city ? city->cityName : "Unknown City";
    }
    void dfsAllPaths(int u, int d, vector<bool>& visited, vector<int>& path, vector<vector<int> >& allPaths) {
        visited[u] = true;
        path.push_back(u);
        if (u == d) {
            allPaths.push_back(path);
        } else {
            vector<Edge> neighbors = adjList[u];
            for (int i = 0; i < neighbors.size(); i++) {
                int v = neighbors[i].toCityID;
                if (!visited[v]) {
                    dfsAllPaths(v, d, visited, path, allPaths);
                }
            }
        }
        path.pop_back();
        visited[u] = false;
    }
    void merge(vector<City>& cities, int left, int mid, int right) {
        vector<City> temp;
        int i = left;
        int j = mid + 1;

        while (i <= mid && j <= right) {
            if (cities[i].population >= cities[j].population) {
                temp.push_back(cities[i]);
                i++;
            } else {
                temp.push_back(cities[j]);
                j++;
            }
        }

        while (i <= mid) {
            temp.push_back(cities[i]);
            i++;
        }


        while (j <= right) {
            temp.push_back(cities[j]);
            j++;
        }

        for (int k = 0; k < temp.size(); k++) {
            cities[left + k] = temp[k];
        }
    }
    void mergeSortHelper(vector<City>& cities, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortHelper(cities, left, mid);
            mergeSortHelper(cities, mid + 1, right);
            merge(cities, left, mid, right);
        }
    }
    class HashTable {
    private:
        static const int TABLE_SIZE = 101;  
        vector<City> table;
        vector<bool> occupied;

        int hashFunction(int key) {
            return key % TABLE_SIZE;
        }

    public:
        HashTable() {
            table.resize(TABLE_SIZE);
            occupied.resize(TABLE_SIZE, false);
        }

        void insert(City city) {
            int index = hashFunction(city.cityID);
            int startIndex = index;

            while (occupied[index]) {
                index = (index + 1) % TABLE_SIZE;
                if (index == startIndex) {
                    cerr << "Hash Table is full, cannot insert city ID: " << city.cityID << endl;
                    return;
                }
            }

            table[index] = city;
            occupied[index] = true;
        }

        City* search(int cityID) {
            int index = hashFunction(cityID);
            int startIndex = index;

            while (occupied[index]) {
                if (table[index].cityID == cityID) {
                    return &table[index];
                }
                index = (index + 1) % TABLE_SIZE;
                if (index == startIndex) break;
            }
            return NULL;
        }

        void display() {
            cout << "\nHash Table Contents:\n";
            for (int i = 0; i < TABLE_SIZE; i++) {
                if (occupied[i]) {
                    cout << "[" << i << "] "
                         << table[i].cityID << " - " << table[i].cityName << ", "
                         << table[i].province << endl;
                }
            }
        }
    };

    HashTable cityHashTable;

public:
    Graph() : adjList(101) {}

    void addCity(City city) {
        cityList.push_back(city);
    }

    void addEdge(int fromCityID, int toCityID, int weight) {
    if (fromCityID < adjList.size()) {
        Edge e;
        e.toCityID = toCityID;
        e.weight = weight;
        adjList[fromCityID].push_back(e);
    }
}
    void parseAndAddConnections(int fromCityID, string connections) {
        stringstream ss(connections);
        string segment;
        
        while(getline(ss, segment, ';')) {
            stringstream segment_ss(segment);
            string id_str, weight_str;
            
            if(getline(segment_ss, id_str, ':') && getline(segment_ss, weight_str)) {
                int toCityID = 0;
                int weight = 0;
                
                stringstream id_converter(id_str);
                stringstream weight_converter(weight_str);

                id_converter >> toCityID;
                weight_converter >> weight;
                
                if (toCityID != 0 && weight != 0) {
                    addEdge(fromCityID, toCityID, weight);
                }
            }
        }
    }
    
    

    bool loadFromFile(string filename) {
        fstream file;
        file.open(filename.c_str());

        if (!file.is_open()) {
            cerr << "Error: Could not open file " << filename << endl;
            return false;
        }

        string line;
        int line_count = 0;

        while (getline(file, line)) {
            if (line.empty()) continue; 

            if (line_count == 0) {
                line_count++;
                continue;
            }

            stringstream ss(line);
            string field;
            vector<string> fields;

            while (getline(ss, field, ',')) {
                fields.push_back(field);
            }

            if (fields.size() < 7) {
                cerr << "Warning: Malformed line with " << fields.size() << " fields, skipping: " << line << endl;
                continue;
            }
            
            City city;
            stringstream s_id(fields[0]);       s_id >> city.cityID;
            city.cityName = fields[1];
            city.province = fields[2];
            stringstream s_pop(fields[3]);      s_pop >> city.population;
            stringstream s_area(fields[4]);     s_area >> city.area;
            stringstream s_pc(fields[5]);       s_pc >> city.postalCode;
            string connections_str = fields[6];
            
            cityHashTable.insert(city);
            addCity(city);
            parseAndAddConnections(city.cityID, connections_str);
            
            line_count++;
        }

        file.close();
        return true;
    }
    

    void printGraph() {
        cout << "--- Pakistan Cities Graph ---" << endl;
        for (int i = 0; i < cityList.size(); i++) {
            City city = cityList[i];
            cout << "\n[" << city.cityID << "] " << city.cityName << ", " << city.province 
                << " (Pop: " << city.population << ")" << endl;

            if (city.cityID < adjList.size() && !adjList[city.cityID].empty()) {
                vector<Edge> neighbors = adjList[city.cityID];
                cout << "  -> Connections:" << endl;
                for (int j = 0; j < neighbors.size(); j++) {
                    Edge neighbor = neighbors[j];
                    string neighborName = getCityNameById(neighbor.toCityID);
                    cout << "    - To: " << neighborName << " (" << neighbor.toCityID << ")"
                         << ", Weight: " << neighbor.weight << endl;
                }
            } else {
                cout << "  -> No outgoing connections." << endl;
            }
        }
        cout << "--------------------------" << endl;
    }
    
    void dijkstra(int startCityID) {
        vector<int> distances(adjList.size(), INT_MAX);
        
        PriorityQueue pq;

        distances[startCityID] = 0;
        pq.push({startCityID, 0});

        cout << "\n--- Dijkstra's Shortest Path from " << getCityNameById(startCityID) << " ---" << endl;

        while (!pq.empty()) {
            Edge currentNode = pq.top();
            pq.pop();

            int u = currentNode.toCityID;
            int dist_u = currentNode.weight;

            if (dist_u > distances[u]) {
                continue;
            }

            vector<Edge> neighbors = adjList[u];
            for (int i = 0; i < neighbors.size(); i++) {
                Edge neighborEdge = neighbors[i];
                int v = neighborEdge.toCityID;
                int weight_uv = neighborEdge.weight;

                if (distances[u] != INT_MAX && distances[u] + weight_uv < distances[v]) {
                    distances[v] = distances[u] + weight_uv;
                    pq.push({v, distances[v]});
                }
            }
        }

        for (int i = 1; i < distances.size(); i++) {
            if (!getCityNameById(i).empty() && getCityNameById(i) != "Unknown City") {
                if(distances[i] == INT_MAX) {
                    cout << "Distance to " << getCityNameById(i) << " (" << i << ") is: Unreachable" << endl;
                } else {
                    cout << "Distance to " << getCityNameById(i) << " (" << i << ") is: " << distances[i] << endl;
                }
            }
        }
        cout << "------------------------------------------" << endl;
    }
    void findAllPaths(int start, int end) {
        cout << "\n--- Finding all paths from " << getCityNameById(start) << " to " << getCityNameById(end) << " ---" << endl;
        
        vector<bool> visited(adjList.size(), false);
        vector<int> path;
        vector<vector<int>> allPaths;

        dfsAllPaths(start, end, visited, path, allPaths);
        
        if (allPaths.empty()) {
            cout << "No path found between " << getCityNameById(start) << " and " << getCityNameById(end) << endl;
        } else {
            cout << "Found " << allPaths.size() << " paths:" << endl;
            for (int i = 0; i < allPaths.size(); i++) {
                cout << "Path " << i + 1 << ": ";
                for (int j = 0; j < allPaths[i].size(); j++) {
                    cout << getCityNameById(allPaths[i][j]);
                    if (j < allPaths[i].size() - 1) {
                        cout << " -> ";
                    }
                }
                cout << endl;
            }
        }
        cout << "----------------------------------------------------" << endl;
    }
    void mergeSortByPopulation() {
        vector<City> newCityList = cityList;
        mergeSortHelper(newCityList, 0, cityList.size() - 1);
        for (int i = 0; i < newCityList.size(); i++) {
            cout << "  Name: " << newCityList[i].cityName;
            cout << ", Population: " << newCityList[i].population ;
            cout << endl;
        }
    }
    void insertionSortByArea() {
        vector<City> newCityList = cityList;
        for (int i = 1; i < newCityList.size(); i++) {
            City key = newCityList[i];
            int j = i - 1;
            while (j >= 0 && newCityList[j].area < key.area) {
                newCityList[j + 1] = newCityList[j];
                j = j - 1;
            }
            newCityList[j + 1] = key;
        }
        for (int i = 0; i < newCityList.size(); i++) {
            cout << "  Name: " << newCityList[i].cityName;
            cout << ", Area: " << newCityList[i].area << " km2";
            cout << endl;
        }
    }
    vector<City>& getCityList() {
        return cityList;
    }
    void bubbleSortByFromCity(vector<MSTEdge>& edges) {
        for (int i = 0; i < edges.size() - 1; i++) {
             for (int j = 0; j < edges.size() - i - 1; j++) {
                if (edges[j].from > edges[j + 1].from) {
                    swap(edges[j], edges[j + 1]);
                }
            }
        }
    }
   void selectionSortByWeight(vector<MSTEdge>& edges) {
       for (int i = 0; i < edges.size() - 1; i++) {
           int minIndex = i;
            for (int j = i + 1; j < edges.size(); j++) {
                if (edges[j].weight < edges[minIndex].weight) {
                    minIndex = j;
                }
            }
            if (minIndex != i) {
                swap(edges[i], edges[minIndex]);
            }  
        }
    }
    void BFS(int id){
        if(id >= adjList.size()){
            cout << "Invalid Starting City" << endl;
             return;
        }
        vector<int> visited(adjList.size(), 0);
        queue<int> q;
        visited[id] = 1;
        q.push(id);

        while(!q.empty()){
            int index = q.front();
            q.pop();
            cout << "[" << index << "] " << getCityNameById(index) << endl;

            for(int i = 0; i < adjList[index].size(); i++){
                Edge mutual = adjList[index][i];
                if(visited[mutual.toCityID] == 0){
                    visited[mutual.toCityID] = 1;
                    q.push(mutual.toCityID);
                }
            }
        }
    }
    void primsMST(int startCityID) {
        int n = adjList.size();
        vector<bool> inMST(n, false);
        vector<int> key(n, INT_MAX);   
        vector<int> parent(n, -1);     

        key[startCityID] = 0;

        for (int count = 0; count < cityList.size(); count++) {
            int u = -1;

        
            for (int i = 0; i < cityList.size(); i++) {
                if (!inMST[i] && (u == -1 || key[i] < key[u])) {
                    u = i;
                }
            }

            if (u == -1) break;

            inMST[u] = true;

       
           for (int i = 0; i < adjList[u].size(); i++) {
                int v = adjList[u][i].toCityID;
                int w = adjList[u][i].weight;

                if (!inMST[v] && w < key[v]) {
                   key[v] = w;
                   parent[v] = u;
                }
            }
       }
        vector<MSTEdge> mstEdges;
        int totalWeight = 0;

        for (int i = 0; i < cityList.size(); i++) {
        if (parent[i] != -1) {
            MSTEdge edge;
            edge.from = getCityNameById(parent[i]);
            edge.to = getCityNameById(i);
            edge.weight = key[i];
            totalWeight += key[i];
            mstEdges.push_back(edge);
        }
    }


    selectionSortByWeight(mstEdges);


    cout << "\nSorted MST Edges:\n";
    for (int i = 0; i < mstEdges.size(); i++) {
        cout << mstEdges[i].from << " --> " << mstEdges[i].to
              << " (Weight: " << mstEdges[i].weight << ")\n";
    }
    cout << "Total Weight of MST: " << totalWeight << endl;

    }

};

class Node {
public:
    Node* lchild;
    int data; 
    City cityData; 
    Node* rchild;
    int height;
};
class AVL {
public:
    Node* root;

    AVL() { root = nullptr; }

    int NodeHeight(Node* p);
    int BalanceFactor(Node* p);
    Node* LLRotation(Node* p);
    Node* RRRotation(Node* p);
    Node* LRRotation(Node* p);
    Node* RLRotation(Node* p);

    Node* rInsert(Node* p, City newCity);
    Node* Search(int key);
};

int AVL::NodeHeight(Node* p) {
    int hl = (p && p->lchild) ? p->lchild->height : 0;
    int hr = (p && p->rchild) ? p->rchild->height : 0;
    return hl > hr ? hl + 1 : hr + 1;
}

int AVL::BalanceFactor(Node* p) {
    int hl = (p && p->lchild) ? p->lchild->height : 0;
    int hr = (p && p->rchild) ? p->rchild->height : 0;
    return hl - hr;
}

Node* AVL::LLRotation(Node* p) {
    Node* pl = p->lchild;
    Node* plr = pl->rchild;

    pl->rchild = p;
    p->lchild = plr;

    p->height = NodeHeight(p);
    pl->height = NodeHeight(pl);

    if (root == p) {
        root = pl;
    }
    return pl;
}

Node* AVL::RRRotation(Node* p) {
    Node* pr = p->rchild;
    Node* prl = pr->lchild;

    pr->lchild = p;
    p->rchild = prl;

    p->height = NodeHeight(p);
    pr->height = NodeHeight(pr);

    if (root == p) {
        root = pr;
    }
    return pr;
}

Node* AVL::LRRotation(Node* p) {
    Node* pl = p->lchild;
    p->lchild = RRRotation(pl);
    return LLRotation(p);
}

Node* AVL::RLRotation(Node* p) {
    Node* pr = p->rchild;
    p->rchild = LLRotation(pr);
    return RRRotation(p);
}

Node* AVL::rInsert(Node* p, City newCity) {
    if (p == nullptr) {
        Node* t = new Node;
        t->data = newCity.cityID;
        t->cityData = newCity;
        t->lchild = nullptr;
        t->rchild = nullptr;
        t->height = 1;
        return t;
    }

    if (newCity.cityID < p->data) {
        p->lchild = rInsert(p->lchild, newCity);
    } else if (newCity.cityID > p->data) {
        p->rchild = rInsert(p->rchild, newCity);
    }

    p->height = NodeHeight(p);

    if (BalanceFactor(p) == 2 && BalanceFactor(p->lchild) == 1) {
        return LLRotation(p);
    } else if (BalanceFactor(p) == 2 && BalanceFactor(p->lchild) == -1) {
        return LRRotation(p);
    } else if (BalanceFactor(p) == -2 && BalanceFactor(p->rchild) == -1) {
        return RRRotation(p);
    } else if (BalanceFactor(p) == -2 && BalanceFactor(p->rchild) == 1) {
        return RLRotation(p);
    }

    return p;
}

Node* AVL::Search(int key) {
    Node* t = root;
    while(t != nullptr) {
        if (key == t->data) {
            return t;
        } else if (key < t->data) {
            t = t->lchild;
        } else {
            t = t->rchild;
        }
    }
    return nullptr;
}

class ChainingHashTable {
public:
    vector<AVL*> table;
    int size;

    ChainingHashTable(int tableSize = 10) {
        size = tableSize;
        table.resize(size);
        for (int i = 0; i < size; i++) {
            table[i] = new AVL();
        }
    }

    int hashFunction(int key) {
        return key % size;
    }

    void insert(City city) {
        int index = hashFunction(city.cityID);
        table[index]->root = table[index]->rInsert(table[index]->root, city);
    }

    City* search(int cityID) {
        int index = hashFunction(cityID);
        Node* resultNode = table[index]->Search(cityID);
        if (resultNode != nullptr) {
            return &(resultNode->cityData);
        }
        return nullptr;
    }
};
void displayMenu() {
    cout << "\n===== PAKISTAN CITIES DATA ANALYSIS MENU =====" << endl;
    cout << "1. Display data of all Cities (Graph View)" << endl;
    cout << "2. Search for a City by ID (using Hash Table and AVL Tree)" << endl;
    cout << "3. Sort Cities by Area (Insertion Sort - Descending)" << endl;
    cout << "4. Sort Cities by Population (Merge Sort - Descending)" << endl;
    cout << "5. Find Shortest Paths from a City (Dijkstra's Algorithm)" << endl;
    cout << "6. Find All Paths Between Two Cities (DFS)" << endl;
    cout << "7. Find the cities that are connected to the City" << endl;
    cout << "8. Display MST using Prim's Algorithm" << endl;
    cout << "9. Exit" << endl;
    cout << "============================================" << endl;
    cout << "Enter your choice: ";
}

int main() {
    Graph dataManager;
    string filename = "pakistan_data_100_weighted.csv";

    cout << "Loading city data from " << filename << "..." << endl;
    if (!dataManager.loadFromFile(filename)) {
        cout << "Failed to load data. Exiting." << endl;
        return 1;
    }
    cout << "Data loaded successfully." << endl;

    ChainingHashTable hashTable(10);
    vector<City>& allCities = dataManager.getCityList();
    for (City& c : allCities) {
        hashTable.insert(c);
    }

    int choice;
    do {
        displayMenu();
        cin >> choice;

        switch (choice) {
            case 1:
                dataManager.printGraph();
                break;
            case 2: {
                int id;
                cout << "Enter City ID to search: ";
                cin >> id;
                City* foundCity = hashTable.search(id);
                if (foundCity != nullptr) {
                    cout << "Found City:\n  Name: " << foundCity->cityName
                         << ", Province: " << foundCity->province
                         << ", Population: " << foundCity->population
                         << ", Area: " << foundCity->area << " km2" << endl;
                } else {
                    cout << "City with ID " << id << " not found." << endl;
                }
                break;
            }
            case 3:
                cout << "\n--- Sorting cities by area (Descending) ---" << endl;
                dataManager.insertionSortByArea();
                break;
            case 4:
                cout << "\n--- Sorting cities by population (Descending) ---" << endl;
                dataManager.mergeSortByPopulation();
                break;
            case 5: {
                int id;
                cout << "Enter starting City ID for Dijkstra's: ";
                cin >> id;
                dataManager.dijkstra(id);
                break;
            }
            case 6: {
                int start, end;
                cout << "Enter starting City ID: ";
                cin >> start;
                cout << "Enter destination City ID: ";
                cin >> end;
                dataManager.findAllPaths(start, end);
                break;
            }
            case 7: {
                int id;
                cout << "Enter starting City ID for BFS: ";
                cin >> id;
                dataManager.BFS(id);
                break;
            }
            case 8: {
                int id;
                cout << "Enter starting City ID for Prim's MST: ";
                cin >> id;
                dataManager.primsMST(id);
                break;
            }
            case 9:
                cout << "Exiting program. Goodbye!" << endl;
                break;
            default:
                cout << "Invalid choice. Please try again." << endl;
                break;
        }
    } while (choice != 9);

    return 0;
}
