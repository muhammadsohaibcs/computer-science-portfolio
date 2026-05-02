
# � Data Structures & Algorithms Masterclass

<div align="center">

[![C++](https://img.shields.io/badge/C++-11%2F14%2F17-blue?style=for-the-badge&logo=c%2B%2B)](.)
[![Algorithms](https://img.shields.io/badge/Algorithms-Advanced-orange?style=for-the-badge)](.)
[![Systems](https://img.shields.io/badge/Systems-Production%20Grade-red?style=for-the-badge)](.)
[![Performance](https://img.shields.io/badge/Performance-Optimized-success?style=for-the-badge)](.)

**Production-grade data structures, advanced algorithms, and high-performance systems built in C++**

</div>

---

## 📂 Directory Structure

```
dsa/
├── assignments/               # Structured DSA problems
│   ├── assignment-2/
│   ├── assignment-3/
│   └── assignment-4/
│
├── linked-lists/              # LinkedList implementations
│   ├── singly/               # Single & Circular
│   ├── doubly/               # Doubly-linked lists
│   └── circular/
│
├── practice/                  # Practice implementations
│   ├── dsa.cpp               # Core structures
│   ├── doubly-linked-list-basic.cpp
│   └── practice-task-*.cpp
│
├── lab-sessions/              # Lab work & labs
│   ├── lab-array-operations.cpp
│   ├── lab3-student-records.cpp
│   └── lab8.cpp
│
├── midterm/                   # Midterm exam prep
│   ├── BST.cpp/h             # Binary Search Trees
│   ├── LinkedList.cpp/h      # List implementation
│   ├── Stack.cpp/h           # Stack ADT
│   ├── Queue.cpp/h           # Queue ADT
│   └── project.cpp           # Integrated project
│
├── final-project/             # Capstone project
│   ├── final.cpp             # Graph analysis system
│   └── pakistan_data_weighted.csv
│
├── multiprocessing and multithreading/
│   ├── multiprocessing.cpp
│   ├── multiprocessing2.cpp
│   └── multithreading.cpp
│
└── README.md
```

---

## 🎯 Featured Project: Pakistan Cities Graph Analysis System

### Project Overview

**Pakistan Cities Graph Analysis System** is a sophisticated data structures and algorithms project that models Pakistan's cities as a weighted graph and performs advanced graph algorithms for route optimization, connectivity analysis, and shortest path computation.

### 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│    Input: Pakistan Cities Dataset       │
│  (Cities, distances, connections)       │
└────────────────┬────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │  Graph Construction     │
    │  (Adjacency Matrix)     │
    └────────────┬────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
 ┌───▼────────┐     ┌───────▼────┐
 │ Algorithms │     │ Data Struct │
 │ - Dijkstra │     │ - AVL Tree  │
 │ - BFS      │     │ - Hash Tbl  │
 │ - DFS      │     │ - Heap      │
 │ - Prim MST │     │ - Trie      │
 └───┬────────┘     └───────┬────┘
     │                      │
     └──────────┬───────────┘
                │
     ┌──────────▼──────────┐
     │  Results & Reports  │
     │ - Shortest routes   │
     │ - MST connectivity  │
     │ - Optimal networks  │
     └─────────────────────┘
```

### 🎯 Key Features

#### Graph Algorithms
- ✅ **Dijkstra's Algorithm** - Single-source shortest paths
- ✅ **Breadth-First Search (BFS)** - Level-order traversal
- ✅ **Depth-First Search (DFS)** - Complete graph exploration
- ✅ **Prim's Algorithm** - Minimum Spanning Tree
- ✅ **Floyd-Warshall** - All-pairs shortest paths
- ✅ **Topological Sort** - DAG ordering

#### Data Structures
- ✅ **AVL Trees** - Self-balancing binary search trees
- ✅ **Hash Tables** - O(1) average lookup
- ✅ **Priority Queues (Heaps)** - Efficient ordering
- ✅ **Trie Structures** - Prefix-based searching
- ✅ **Union-Find (Disjoint Set)** - Set operations
- ✅ **Linked Lists** - Dynamic collections

#### Optimization Techniques
- ✅ **Time Complexity Analysis** - Big-O notation
- ✅ **Space Optimization** - Memory-efficient implementations
- ✅ **Caching & Memoization** - Avoid recomputation
- ✅ **Index Structures** - Fast data retrieval
- ✅ **Parallel Processing** - Multi-threaded execution

### 💻 Technology Stack

```
C++ 11/14/17         - Modern C++ features
STL (Standard Library) - Built-in containers
PThreads             - Multi-threading
File I/O             - CSV data handling
Algorithm Library    - Standard algorithms
```

### 🔑 Core Algorithms Explained

#### Dijkstra's Algorithm
```cpp
// Finds shortest path from source to all vertices
// Time Complexity: O((V + E) log V) with binary heap
Priority Queue pq;
map<City, int> distance;

distance[source] = 0;
pq.push({0, source});

while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    
    if (d > distance[u]) continue;
    
    for (auto [v, w] : graph[u]) {
        if (distance[u] + w < distance[v]) {
            distance[v] = distance[u] + w;
            pq.push({distance[v], v});
        }
    }
}
```

#### Prim's Minimum Spanning Tree
```cpp
// Finds minimum weight spanning tree
// Time Complexity: O((V + E) log V)
set<City> inMST;
Priority Queue pq;

inMST.insert(startCity);
for (auto [neighbor, weight] : graph[startCity]) {
    pq.push({weight, startCity, neighbor});
}

while (!pq.empty() && inMST.size() < V) {
    auto [w, u, v] = pq.top();
    pq.pop();
    
    if (inMST.count(v)) continue;
    inMST.insert(v);
    
    for (auto [next, weight] : graph[v]) {
        if (!inMST.count(next)) {
            pq.push({weight, v, next});
        }
    }
}
```

### 📊 Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|-----------------|------------------|----------|
| Dijkstra | O((V+E) log V) | O(V) | Shortest paths |
| BFS | O(V + E) | O(V) | Level order |
| DFS | O(V + E) | O(V) | Traversal |
| Prim | O((V+E) log V) | O(V) | MST |
| AVL Tree | O(log N) | O(N) | Balanced search |
| Hash Table | O(1) avg | O(N) | Fast lookup |

### 🎓 Learning Outcomes

✅ Understand graph theory and algorithms  
✅ Implement advanced data structures  
✅ Optimize for performance and memory  
✅ Apply algorithms to real-world problems  
✅ Master C++ for systems programming  
✅ Design scalable data-driven systems  

---

## 📚 Curriculum Coverage

### Assignments (1-4)
- Fundamental DSA concepts
- Problem-solving strategies
- Algorithm implementation
- Performance optimization

### Linked Lists
- **Singly Linked Lists** - Basic linked structure
- **Doubly Linked Lists** - Bidirectional traversal
- **Circular Linked Lists** - Loop structure
- **Operations** - Insert, delete, search, reverse

### Lab Sessions
- Array operations and manipulation
- Student record management
- Practical problem-solving
- Real-world data handling

### Midterm Project
**Comprehensive System:**
- Binary Search Trees (BST)
- Stack and Queue implementations
- Integrated data structure system
- Hospital visit dataset analysis

### Final Project
**Pakistan Cities Graph Analysis:**
- Graph construction from real data
- Multiple algorithm implementations
- Route optimization
- Network analysis and reporting

### Multiprocessing & Multithreading
- Concurrent algorithm execution
- Thread synchronization
- Performance analysis
- Parallel data processing

---

## 🚀 Quick Start

### Compilation
```bash
g++ -std=c++17 -O2 program.cpp -o program
g++ -std=c++17 -pthread multithreading.cpp -o program
```

### Running Examples
```bash
# Graph analysis
./final_project

# BST operations
./bst_demo

# Linked list operations
./linkedlist_test

# Multithreaded processing
./multithreading
```

---

## 📊 Code Statistics

- **Total Files:** 60+
- **Core Algorithms:** 20+
- **Data Structures:** 15+
- **Test Cases:** Comprehensive

---

## 🎯 Career Highlights

✅ **Algorithmic Problem Solving** - Efficient solutions  
✅ **Data Structure Mastery** - Appropriate selection  
✅ **Performance Optimization** - System-level thinking  
✅ **C++ Proficiency** - Modern language features  
✅ **Real-World Applications** - Practical implementations  

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **OOP (Java):** [../oop](../oop)
- **Security:** [../information-security](../information-security)

---

<div align="center">

**Mastering algorithms is mastering how systems scale and perform.**

*Every algorithm tells a story about efficiency and correctness.*

</div>

**Data Structures:** Arrays, Linked Lists (Singly, Doubly, Circular), Stacks, Queues, Deques, Trees (BST, AVL), Heaps, Graphs  
**Algorithms:** BFS, DFS, Cycle Detection, Sorting, Hashing, Recursion  
**Programming:** C++, Pointers, Dynamic Memory, OOP  
**Systems:** Multithreading (Pthreads), Multiprocessing, File I/O, CSV Processing  
**Concepts:** Time & Space Complexity, Optimization, Modularity  

---

## 🏗️ Repository Structure

```bash
dsa/
├── assignments/
│   ├── assignment-2/
│   ├── assignment-3/
│   ├── assignment-4/
│
├── linked-lists/
│   ├── singly/
│   ├── doubly/
│   ├── circular/
│
├── lab-sessions/
├── midterm/
├── final-project/
├── multiprocessing and multithreading/
├── practice/
└── README.md
````

---

## ⚙️ Core Implementations

### 🔹 Linear Structures

* Stack (Array, Linked List)
* Queue (Linear, Circular, Deque)
* Queue using Stacks
* Two Stacks in One Array

### 🔗 Linked Lists

* Reverse (iterative & recursive)
* Cycle detection
* Pairwise swapping
* Node swapping
* Even-Odd separation
* Circular list (Josephus problem)

### 🌳 Trees

* Binary Search Tree (BST)
* AVL Tree (Self-balancing)

### ⚡ Heaps

* Max Heap
* Min Heap
* Priority Queue

### 🔗 Graphs

* Breadth First Search (BFS)
* Depth First Search (DFS)
* Cycle Detection

### 🧮 Advanced Topics

* Hashing
* Sorting Algorithms
* Recursion Techniques

### ⚙️ Parallel Computing

* Multithreading (Pthreads)
* Multiprocessing
* Performance comparison

---

## 🧪 Projects

### 🏥 Midterm System

* OOP-based architecture
* Integration of BST, Linked Lists, Queues
* Dataset handling

### 📊 Final Project

* CSV-based data processing
* Algorithmic computation
* Real-world dataset usage

---

## 📈 Complexity Overview

* Stack/Queue → O(1)
* BST → O(log n) average
* AVL Tree → O(log n) guaranteed
* Heap → O(log n)
* BFS/DFS → O(V + E)

---

## 🚀 Getting Started

```bash
g++ file.cpp -o run
./run
```

---

## 📊 Highlights

* Full DSA curriculum coverage
* OOP + DSA integration
* Real-world problem simulations
* Clean modular code
* Parallel computing included

---

## 🎯 Use Cases

* Technical interview preparation
* University assignments
* Competitive programming foundation
* System design basics

---

## 🧩 Design Principles

* Clarity over complexity
* Modularity over monolithic code
* Correctness before optimization
* Performance-aware implementation

---

## 🛣️ Learning Path

```
Stacks → Queues → Linked Lists → Recursion
        ↓
     Trees → Heaps → Graphs
        ↓
  Hashing → Optimization → Parallelism
```

---

## 🤝 Contribution

* Add new algorithms
* Optimize implementations
* Improve documentation
* Add test cases

---

## 📄 License

Educational and portfolio use.

---

## 👨‍💻 Author

**Muhammad Sohaib**
Computer Science Student

---

## ⭐ Final Note

This repository represents a complete journey from basic structures to advanced algorithmic thinking and system-level implementation.

```
```
