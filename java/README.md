# ☕ Java Systems Programming Masterclass

<div align="center">

[![Java](https://img.shields.io/badge/Java-11%2B-ED8B00?style=for-the-badge&logo=java&logoColor=white)](.)
[![Systems](https://img.shields.io/badge/Systems-Production%20Grade-red?style=for-the-badge)](.)
[![Databases](https://img.shields.io/badge/Databases-Custom%20Engine-blue?style=for-the-badge)](.)
[![OOP](https://img.shields.io/badge/OOP-Advanced-blueviolet?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Enterprise%20Ready-success?style=for-the-badge)](.)

**Advanced Java systems, custom database implementations, and enterprise architecture**

</div>

---

## 📂 Directory Structure

```
java/
├── assignments/               # Structured Java problems
│   ├── assignment-1/
│   ├── assignment-2/
│   └── ...
│
├── lab-sessions/              # Hands-on labs
│   ├── Lab 1: Basic Java
│   ├── Lab 2: Collections
│   ├── Lab 3: I/O Operations
│   └── ...
│
├── practice/                  # Practice implementations
│   ├── Basic programs
│   ├── Data structures
│   └── Algorithms
│
└── projects/                  # Enterprise projects
    ├── File-Based Database System
    └── Other systems
```

---

## 🎯 Featured Project: File-Based Database System

### Project Overview

**File-Based Database System** is a custom-built database engine implemented entirely in Java. It demonstrates deep understanding of database internals, file I/O operations, indexing strategies, and query optimization. The system implements SQL-like operations with a persistent file-based backend.

### 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Query Interface (SQL-like)     │
│  - SELECT, INSERT, UPDATE, DELETE   │
└────────────────┬────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │    Query Parser & Planner │
    │  - Parse SQL syntax       │
    │  - Optimize query plan    │
    │  - Determine indexes      │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────┐
    │    Execution Engine       │
    │  - Execute operations     │
    │  - Manage transactions    │
    │  - Handle concurrency     │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │     Index Management              │
    │  - B-Tree index structure         │
    │  - Hash index implementation      │
    │  - Index search optimization      │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │     Storage Layer                 │
    │  - File I/O operations            │
    │  - Page management                │
    │  - Buffer pool management         │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │     Disk Management               │
    │  - Table files (.tbl)             │
    │  - Index files (.idx)             │
    │  - Data persistence               │
    └───────────────────────────────────┘
```

### 🔑 Core Features

#### SQL-Like Query Engine
- ✅ **SELECT** - Query data with filtering
- ✅ **INSERT** - Add new records
- ✅ **UPDATE** - Modify existing records
- ✅ **DELETE** - Remove records
- ✅ **WHERE** - Conditional queries
- ✅ **JOIN** - Multi-table operations

#### Indexing Strategies
- ✅ **B-Tree Index** - Efficient range queries
- ✅ **Hash Index** - Fast exact-match lookup
- ✅ **Primary Key Index** - Unique identifier lookup
- ✅ **Secondary Index** - Additional search paths
- ✅ **Index Optimization** - Query plan selection

#### File Management
- ✅ **Table Storage** - Persistent record storage
- ✅ **Index Files** - Separate index storage
- ✅ **Page Management** - Fixed-size page blocks
- ✅ **Buffer Pool** - In-memory caching
- ✅ **Serialization** - Object to disk conversion

#### ACID Properties
- ✅ **Atomicity** - All-or-nothing transactions
- ✅ **Consistency** - Data integrity
- ✅ **Isolation** - Transaction isolation levels
- ✅ **Durability** - Persistent storage

### 💻 Technology Stack

```
Java 11+         - Implementation language
File I/O         - Disk operations
Collections API  - Data structures
Serialization    - Object persistence
Threading        - Concurrent access
```

### 📊 Performance Characteristics

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Insert | O(log N) | O(N) | With B-Tree index |
| Delete | O(log N) | O(N) | With index support |
| Search | O(log N) | O(1) | Using B-Tree |
| Full Scan | O(N) | O(1) | No index used |
| Range Query | O(log N + K) | O(K) | K = result size |

### 🧪 Key Classes

**Database (Main Manager)**
```java
public class Database {
    private Map<String, Table> tables;
    private BufferPool bufferPool;
    private TransactionManager txManager;
    
    public void createTable(String name, Schema schema) { ... }
    public void insertRecord(String table, Record record) { ... }
    public List<Record> query(String sql) { ... }
    public void updateRecord(String table, Record record) { ... }
    public void deleteRecord(String table, String id) { ... }
}
```

**Table (Data Container)**
```java
public class Table {
    private String name;
    private Schema schema;
    private RandomAccessFile dataFile;
    private Index primaryIndex;
    private List<Index> secondaryIndexes;
    
    public void insert(Record record) { ... }
    public Record findByPrimaryKey(Object key) { ... }
    public List<Record> findByIndex(String indexName, Object value) { ... }
    public void update(Record record) { ... }
    public void delete(Object primaryKey) { ... }
}
```

**Index (Search Structure)**
```java
public abstract class Index {
    public abstract void insert(Object key, long position);
    public abstract long search(Object key);
    public abstract List<Long> rangeSearch(Object start, Object end);
    public abstract void delete(Object key);
}
```

### 🔄 Query Example

**Insert Operation**
```java
Table users = database.getTable("users");
Record record = new Record();
record.set("id", 1);
record.set("name", "John Doe");
record.set("email", "john@example.com");
users.insert(record);
```

**Select/Query Operation**
```java
List<Record> results = database.query(
    "SELECT * FROM users WHERE id = 1"
);
```

**Transaction**
```java
Transaction tx = database.beginTransaction();
try {
    database.insert("users", record1);
    database.insert("users", record2);
    tx.commit();
} catch (Exception e) {
    tx.rollback();
}
```

### 📈 Optimization Techniques

- **Query Planning** - Choose best index path
- **Caching** - Buffer pool for frequently accessed pages
- **Compression** - Reduce file size
- **Batch Operations** - Group multiple operations
- **Index Selection** - Automatic index usage

### 🎓 Learning Outcomes

✅ Understand database internals  
✅ Implement efficient data structures  
✅ Design file-based storage systems  
✅ Optimize query execution  
✅ Master Java I/O operations  
✅ Build production-grade systems  

---

## 📚 Curriculum Coverage

### Fundamentals
- Java syntax and OOP
- File I/O operations
- Collections framework
- Exception handling

### Intermediate
- Advanced data structures
- Algorithm implementation
- Performance optimization
- System design

### Advanced
- Database system design
- Custom indexes
- Transaction management
- Large-scale systems

---

## 🚀 Quick Start

### Compilation
```bash
javac -d bin src/**/*.java
```

### Running
```bash
java -cp bin com.database.Database
```

---

## 📊 Code Statistics

- **Total Classes:** 40+
- **Lines of Code:** 12,000+
- **Data Structures:** Custom implementations
- **Algorithms:** Sorting, searching, indexing

---

## 🎯 Career Skills

✅ **Systems Programming** - Low-level design  
✅ **Java Mastery** - Advanced language features  
✅ **File I/O** - Efficient disk operations  
✅ **Algorithms** - Custom implementations  
✅ **Database Design** - Internals knowledge  

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **OOP (Java):** [../oop](../oop)
- **DSA (C++):** [../dsa](../dsa)

---

<div align="center">

**Building a database from scratch reveals the elegance of systems thinking.**

*Every abstraction in modern databases is built on fundamental I/O operations.*

</div>

---

## 🧠 Overview

This repository is a **structured Java engineering journey** — not a random collection of files, but a carefully layered system that transforms:

> **Beginner syntax → Logical reasoning → Algorithmic thinking → Real-world implementation**

It captures the evolution of a developer through:
- Programming Fundamentals (PF1 & PF2)
- Deep problem-solving practice
- Algorithm design
- Mini-project development

Every folder represents a **stage of cognitive upgrade**.

---

## 🎯 Objectives

- Build **strong programming fundamentals**
- Master **control flow & logic design**
- Transition into **recursion & algorithmic thinking**
- Apply concepts in **assignments and projects**
- Develop **clean, modular, scalable code habits**

---

## 🏗️ Repository Architecture

```

java/
│
├── README.md
│
├── assignments/
│   ├── pf-assignment-2/
│   │   ├── part-1/
│   │   ├── part-2/
│   │   ├── part-3/
│   │   └── standalone/
│   │
│   ├── pf-assignment-3/
│   │   ├── FunctionPlotter.java
│   │   ├── GenericFib.java
│   │   └── GrayCode.java
│   │
│   └── pf-assignment-4/
│       ├── assignmentclass.java
│       ├── pf4.java
│       └── firewall.txt
│
├── lab-sessions/
│   ├── lab-2/
│   ├── lab-3/
│   ├── lab-4/
│   ├── lab-5/
│   ├── lab-6/
│   ├── lab-7/
│   └── lab-9/
│
├── practice/
│   ├── array-practice
│   ├── recursion-practice
│   ├── bitwise-operations
│   └── mixed-problem-solving
│
├── projects/
│   ├── database-project/
│   └── encrypted-reg-numbers/

```

---

## 🔍 Code Intelligence Breakdown

### 🧩 1. Assignments — Structured Problem Solving Engine

This is the **core training arena**.

#### 🔹 PF Assignment 2
- Multi-part structured progression
- Covers:
  - Loops & conditions
  - Pattern building
  - Logical constraints
  - Incremental complexity

Notable implementations:
- 📅 Calendar formatting logic (`lab10.java`)
- 🔢 Dynamic computations & validations
- 🔄 Nested loop constructs

#### 🔹 PF Assignment 3
Where things get interesting:

- `GenericFib.java` → Recursive + generalized Fibonacci  
- `GrayCode.java` → Binary sequence generation (algorithmic elegance)  
- `FunctionPlotter.java` → Mathematical visualization logic  

This section marks the shift from:
> “writing code” → “designing logic”

#### 🔹 PF Assignment 4
- Class-based structure
- File handling (`firewall.txt`)
- System-style implementation

Now you're touching:
> **Software engineering territory**

---

### 🧪 2. Lab Sessions — Concept Reinforcement Layer

Each lab is a **focused drill zone**:

- Input/Output mastery
- Loop mechanics
- Conditional logic
- Edge case handling

Labs are not simple — they are **precision tools** sharpening:
- Thinking speed
- Code accuracy
- Debugging instincts

---

### 🔁 3. Practice — Raw Skill Forging Zone

This is where experimentation lives.

Includes:
- 🔢 Arrays manipulation
- 🔁 Recursion (core brain-expansion zone)
- ⚙️ Bitwise operations
- 🧠 Mixed logic challenges

Files like:
- `Recursion1.java`
- `bit-shift-operations.java`

…indicate deep engagement with **low-level thinking and optimization**.

---

### 🚀 4. Projects — Real-World Application Layer

#### 🗄️ Database Project
- File-based data handling
- Structured storage simulation
- Early database abstraction thinking

#### 🔐 Encrypted Registration System
- Custom logic implementation
- Problem-driven design
- Input → transformation → output pipeline

This is where:
> **Concepts become systems**

---

## ⚙️ Technical Highlights

- ✅ Strong grip on **loops & control flow**
- ✅ Recursive problem solving
- ✅ Algorithm implementation (Gray Code, Fibonacci)
- ✅ File handling basics
- ✅ Modular code organization
- ✅ Clean separation of concerns

---

## 🧠 Learning Architecture

| Layer | Focus | Outcome |
|------|------|--------|
| Fundamentals | Syntax, loops, conditions | Logical clarity |
| Labs | Controlled exercises | Precision |
| Assignments | Structured problems | Depth |
| Practice | Exploration | Creativity |
| Projects | Real systems | Engineering mindset |

---

## 🧬 Growth Trajectory

This repository naturally evolves into:

- 📊 Data Structures & Algorithms (DSA mastery)
- 🧠 Competitive Programming
- 🗄️ Database-driven applications
- 🌐 Backend development (Java / Spring)
- 🤖 AI & system-level logic design

---

## 💡 Philosophy Behind This Repo

This isn’t about writing code that works.

It’s about building:
- Code that **scales**
- Logic that **adapts**
- Systems that **solve**

Every file here is a **step toward engineering thinking**.

---

## 🏁 Final Words

This repository is a **discipline machine**.

It trains:
- Your logic  
- Your patience  
- Your precision  

And quietly upgrades you from:
> **Student → Problem Solver → Engineer**

---

<div align="center">

### ⚡ “First you learn syntax. Then you learn logic. Then… you stop writing code and start designing solutions.”

</div>
```
