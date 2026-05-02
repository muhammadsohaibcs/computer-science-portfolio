# Pakistan Cities Graph Analysis System

## What's Implemented

A C++ program that demonstrates graph data structures and algorithms using real Pakistan city data.

### Data Structures

1. **Custom Min Heap (Priority Queue)**
   - Implemented with `siftUp()` and `siftDown()` operations
   - Used for Dijkstra's algorithm

2. **Hash Table with Linear Probing**
   - Table size: 101
   - Hash function: `key % TABLE_SIZE`
   - Used for fast city lookup by ID

3. **Graph - Adjacency List**
   - Stores 101 cities as vertices
   - Uses vectors of edges for connections
   - Supports weighted edges (distances in km)

### Algorithms Implemented

1. **Dijkstra's Shortest Path**
   ```cpp
   void dijkstra(int startCityID)
   ```
   - Finds shortest path from source to all reachable cities
   - Uses priority queue for efficiency
   - Outputs: distances to each city

2. **Breadth-First Search (BFS)**
   ```cpp
   void BFS(int id)
   ```
   - Level-by-level graph traversal
   - Uses standard queue

3. **Depth-First Search (DFS)**
   ```cpp
   void dfsAllPaths(int u, int d, vector<bool>& visited, 
                    vector<int>& path, vector<vector<int>>& allPaths)
   ```
   - Finds all possible paths between two cities
   - Backtracks when path ends

4. **Prim's Minimum Spanning Tree**
   ```cpp
   void primsMST(int startCityID)
   ```
   - Builds MST by greedily selecting minimum edges
   - Tracks parent vertices to reconstruct tree

5. **Merge Sort**
   ```cpp
   void mergeSortByPopulation()
   ```
   - Sorts cities by population in descending order

6. **Insertion Sort**
   ```cpp
   void insertionSortByArea()
   ```
   - Sorts cities by area in descending order

7. **Additional Sorts for MST Edges**
   - Bubble sort by city name
   - Selection sort by weight

### Files

- `final.cpp` - Complete implementation (~700+ lines)
- `pakistan_data_weighted.csv` - City dataset with connections

### Key Functions

```cpp
// Load city data from CSV
bool loadFromFile(string filename)

// Print graph structure
void printGraph()

// Algorithm runners
void dijkstra(int startCityID)
void BFS(int id)
void findAllPaths(int start, int end)
void primsMST(int startCityID)
void mergeSortByPopulation()
void insertionSortByArea()
```

### Data Format

Cities stored with:
- cityID
- cityName  
- province
- population
- area
- postalCode
- connections (edges to other cities with weights)

---

## ✅ What You Accomplished

✅ Custom priority queue implementation with heap operations
✅ Hash table with collision handling  
✅ Graph representation with adjacency lists
✅ Dijkstra's shortest path algorithm
✅ BFS and DFS traversal algorithms
✅ Prim's MST algorithm
✅ Multiple sorting algorithms (merge, insertion, bubble, selection)
✅ CSV file parsing for real city data
✅ Interactive menu-driven interface
✅ Started AVL tree implementation

