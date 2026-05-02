# � Artificial Intelligence & Intelligent Systems Masterclass

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](.)
[![Prolog](https://img.shields.io/badge/Prolog-Logic%20Programming-red?style=for-the-badge)](.)
[![AI](https://img.shields.io/badge/AI-Advanced%20Algorithms-purple?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Academic%20Grade-blue?style=for-the-badge)](.)

**Intelligent systems, search algorithms, knowledge representation, and automated reasoning**

</div>

---

## 📂 Directory Structure

```
Artificial Intelligence/
├── Lab1.py                    # Introduction to AI
├── Lab2ML.py                  # Machine Learning basics
├── Lab31.py                   # Search algorithms part 1
├── Lab32.py                   # Search algorithms part 2
├── lab41.py                   # Knowledge representation
├── lab42.py                   # Reasoning engines
├── lab51.py                   # Game AI part 1
├── lab52.py                   # Game AI part 2
│
├── Activities.py              # AI activities and challenges
├── Astar.py                   # A* pathfinding algorithm
├── ucs.py                     # Uniform Cost Search
├── geneticAlgorithm.py        # Evolutionary algorithms
│
├── diagnosis.pl               # Prolog medical diagnosis
├── Lab12.pl                   # Prolog logic programming 1
├── Lab14.pl                   # Prolog logic programming 2
├── Wapus.pl                   # Wumpus world simulation
│
└── README.md
```

---

## 🎯 Key Projects & Concepts

### 🔍 Search Algorithms

#### Uniform Cost Search (UCS)
- **Purpose:** Find optimal path with variable edge costs
- **Algorithm:** Priority queue-based exploration
- **Complexity:** O((V + E) log V)
- **Implementation:** `ucs.py`

```python
# Priority queue with costs
# Pop minimum cost node first
# Expand until goal found
```

#### A* Pathfinding (Astar.py)
- **Purpose:** Efficient optimal path finding
- **Formula:** f(n) = g(n) + h(n)
  - g(n) = cost from start
  - h(n) = estimated cost to goal
- **Complexity:** O((V + E) log V)
- **Features:**
  - Heuristic-guided search
  - Optimal path finding
  - Real-world applications (robotics, games)

```python
# Open set with f-score ordering
# Expand most promising nodes first
# Use heuristic for guidance
```

#### Genetic Algorithm
- **Purpose:** Evolutionary optimization
- **Concepts:**
  - Population-based search
  - Crossover and mutation
  - Fitness evaluation
  - Natural selection
- **Applications:**
  - Function optimization
  - Game AI
  - Scheduling problems

---

### 🎮 Game AI

#### AI Agents (Lab51.py, Lab52.py)
- **Agent Architecture:** Perception → Reasoning → Action
- **Decision Making:**
  - Minimax algorithm
  - Alpha-beta pruning
  - Game tree evaluation
- **Applications:**
  - Chess/checkers AI
  - Game opponent logic
  - Autonomous agents

#### Wumpus World (Wapus.pl)
- **Problem:** Navigate dangerous cave with Wumpus
- **Agent Model:**
  - Percepts: Breeze, Stench, Gold
  - Actions: Move, Shoot, Grab
  - Knowledge: World state inference
- **Prolog Implementation:**
  - Logic-based reasoning
  - Fact and rule representation
  - Backtracking search

---

### 📊 Knowledge Representation

#### Prolog Logic Programming
**Key Concepts:**
- Facts and rules
- Unification and backtracking
- Pattern matching
- Recursive reasoning

**Medical Diagnosis (diagnosis.pl)**
- Symptom → Disease reasoning
- Rule-based inference
- Explanations and certainty
- Real-world expert system

**Implementation Files:**
- `Lab12.pl` - Basic Prolog
- `Lab14.pl` - Advanced Prolog
- `Wapus.pl` - Wumpus world logic

---

### 🧬 Machine Learning Foundations (Lab2ML.py)

**Topics Covered:**
- Supervised learning basics
- Classification and regression
- Feature extraction
- Model evaluation
- Real-world datasets

---

### 🎯 Reasoning Engines

#### Forward Chaining
- Start with known facts
- Apply rules to derive new facts
- Continue until goal derived

#### Backward Chaining
- Start with goal
- Work backwards to prove from facts
- Used in Prolog resolution

#### Decision Making
- Rule-based systems
- Expert systems
- Inference engines

---

## 🏆 Curriculum Coverage

### Fundamentals (Lab1)
- Introduction to AI concepts
- Problem-solving approaches
- Search strategies
- State space representation

### Search Algorithms (Lab31, Lab32, Astar.py, ucs.py)
- Uninformed search (BFS, DFS)
- Informed search (A*, UCS)
- Heuristic functions
- Optimality and completeness
- Cost-effective pathfinding

### Games & Intelligent Agents (Lab51, Lab52)
- Game theory basics
- Minimax algorithm
- Alpha-beta pruning
- Multi-agent systems
- Game tree evaluation

### Knowledge Representation (Lab41, Lab42)
- Logical reasoning
- Rule-based systems
- Expert systems
- Knowledge bases

### Evolutionary Algorithms (geneticAlgorithm.py)
- Population-based optimization
- Selection, crossover, mutation
- Fitness landscapes
- Convergence analysis

### Logic Programming (Prolog)
- Declarative programming
- Facts and rules
- Unification
- Backtracking
- Real-world problem solving

---

## 💻 Technology Stack

```
Python 3.8+          - Main implementation
Prolog               - Logic programming
NumPy                - Numerical computing
Search Libraries     - pathfinding tools
Game Development     - AI for games
```

---

## 🎓 Learning Outcomes

✅ Understand AI algorithms and paradigms  
✅ Implement search and game-playing strategies  
✅ Design intelligent agents  
✅ Apply machine learning techniques  
✅ Use logic programming for reasoning  
✅ Solve complex problems algorithmically  
✅ Build knowledge-based systems  

---

## 📚 Key Algorithms Explained

### A* Algorithm
```python
def astar(start, goal, heuristic):
    open_set = {start}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    while open_set:
        current = min(open_set, key=lambda n: f_score[n])
        if current == goal:
            return reconstruct_path()
        
        open_set.remove(current)
        for neighbor in neighbors(current):
            tentative_g = g_score[current] + cost(current, neighbor)
            if tentative_g < g_score.get(neighbor, inf):
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                open_set.add(neighbor)
    
    return None  # No path found
```

### Genetic Algorithm
```python
def genetic_algorithm(population, generations):
    for _ in range(generations):
        # Evaluate fitness
        fitness = [evaluate(individual) for individual in population]
        
        # Selection
        selected = tournament_selection(population, fitness)
        
        # Crossover
        offspring = []
        for i in range(0, len(selected), 2):
            child1, child2 = crossover(selected[i], selected[i+1])
            offspring.extend([child1, child2])
        
        # Mutation
        for individual in offspring:
            mutate(individual)
        
        # New generation
        population = offspring
    
    return best_individual(population)
```

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **Machine Learning:** [../machine-learning](../machine-learning)
- **Information Security:** [../information-security](../information-security)

---

<div align="center">

**Artificial Intelligence is not about copying human intelligence—it's about solving problems through computation.**

*Every algorithm is an intelligent way of thinking about problems.*

</div>

It reflects practical implementations of AI techniques studied during coursework.

---

## 🗂️ Project Structure

```

Artificial Intelligence/
│
├── Lab Tasks/
│   ├── Activities.py
│   ├── Astar.py
│   ├── ucs.py
│   ├── geneticAlgorithm.py
│   ├── Lab1.py
│   ├── lab2.py
│   ├── Lab2ML.py
│   ├── Lab31.py
│   ├── Lab32.py
│   ├── lab41.py
│   ├── lab42.py
│   ├── lab51.py
│   ├── lab52.py
│   │
│   ├── diagnosis.pl
│   ├── Lab12.pl
│   ├── Lab14.pl
│   ├── Wapus.pl
│   │
│   └── CSC 462 _AI Lab Manual.pdf
│
└── .git/

````

---

## 🚀 Implemented Concepts

### 🔎 Search Algorithms
- A* Search (`Astar.py`)
- Uniform Cost Search (`ucs.py`)

### 🧬 Evolutionary Computing
- Genetic Algorithm (`geneticAlgorithm.py`)

### 🧠 Machine Learning
- Basic ML concepts (`Lab2ML.py`)

### 📊 Problem Solving Labs
- Multiple lab tasks covering:
  - State Space Search
  - Heuristics
  - Algorithm Analysis

### ⚙️ Logic Programming (Prolog)
- Knowledge representation
- Rule-based systems
- Diagnosis systems (`diagnosis.pl`)

---

## 🛠️ Technologies Used

- **Python 🐍**
- **Prolog ⚙️**
- Basic AI frameworks and algorithms

---

## 🎯 Key Highlights

✔ Hands-on implementation of core AI algorithms  
✔ Mix of procedural and logical paradigms  
✔ Strong foundation for advanced AI & ML  
✔ Structured lab progression from basics → advanced  

---

## 📚 Learning Outcomes

By working through this repository, you gain:

- Deep understanding of **search strategies**
- Practical exposure to **AI problem modeling**
- Experience with **logic-based AI systems**
- Insight into **optimization techniques**

---

## ⚡ How to Run

### Python Files
```bash
python filename.py
````

### Prolog Files

```bash
consult('filename.pl').
```

---

## 🧠 Future Improvements

* Add visualization for search algorithms
* Integrate advanced ML models
* Convert into full AI toolkit
* Add GUI for simulations

---

## 👨‍💻 Author

**Muhammad Sohaib**
Computer Science Student | AI Enthusiast | Developer

---

## 🌟 Final Note

This repository is not just code —
it’s a **mini AI laboratory**, where algorithms come alive and logic learns to think.


