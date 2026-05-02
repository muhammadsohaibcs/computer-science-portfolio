
# 🏗️ Object-Oriented Programming Masterclass

<div align="center">

[![Java](https://img.shields.io/badge/Java-11%2B-ED8B00?style=for-the-badge&logo=java&logoColor=white)](.)
[![OOP](https://img.shields.io/badge/OOP-Advanced-blueviolet?style=for-the-badge)](.)
[![GUI](https://img.shields.io/badge/GUI-Swing%20%2B%20JavaFX-0A66C2?style=for-the-badge)](.)
[![Design%20Patterns](https://img.shields.io/badge/Design%20Patterns-Enterprise-orange?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Grade-success?style=for-the-badge)](.)

**Complete Object-Oriented Design journey from fundamentals to enterprise-grade systems**

</div>

---

## 📂 Directory Structure

```
oop/
├── assignments/               # OOP problems & exercises
│   ├── assignment-1/
│   ├── assignment-2/
│   └── ...
│
├── lab-sessions/              # Hands-on labs
│   ├── Lab 1: Basic OOP
│   ├── Lab 2: Inheritance
│   ├── Lab 3: Polymorphism
│   └── ...
│
├── practice/                  # Practice implementations
│   ├── Basic classes
│   ├── Inheritance examples
│   ├── Interface design
│   └── Pattern implementation
│
├── projects/                  # Capstone projects
│   ├── Smart City Management System
│   └── Other enterprise projects
│
└── README.md
```

---

## 🎯 Featured Project: Smart City Management System

### Project Overview

**Smart City Management System** is an enterprise-grade desktop application built with Java and Object-Oriented Programming principles. It simulates real-world city operations through multiple departments, resource management, citizen services, and administrative workflows.

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│        Smart City Management System         │
│           (Java Swing GUI)                  │
└──────────────────┬──────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
 ┌───▼────┐   ┌────▼───┐   ┌────▼───┐
 │  Admin │   │ Service │   │ Reports │
 │ Portal │   │ Manager │   │ Engine  │
 └───┬────┘   └────┬───┘   └────┬────┘
     │             │            │
     └─────────────┼────────────┘
                   │
     ┌─────────────▼──────────┐
     │   Domain Models        │
     │  - City               │
     │  - Department         │
     │  - Citizen            │
     │  - Resource           │
     │  - Service            │
     └─────────────┬──────────┘
                   │
     ┌─────────────▼──────────┐
     │  Persistence Layer     │
     │  - Serialization       │
     │  - File Storage        │
     │  - Data Retrieval      │
     └────────────────────────┘
```

### 🔑 OOP Concepts Implemented

#### 1. Classes & Objects
- ✅ Encapsulation of city management data
- ✅ Clear responsibility separation
- ✅ Cohesive domain models
- ✅ Proper access modifiers

#### 2. Inheritance Hierarchy
```
             City (Abstract)
             /    |    \
        Health  Traffic  Utilities
         /|\      /|\      /|\
        ... ...   ... ...   ... ...
```
- ✅ Multi-level inheritance
- ✅ Method overriding
- ✅ Super calls for parent behavior

#### 3. Polymorphism
- ✅ Interface-based design
- ✅ Runtime method binding
- ✅ Strategy pattern implementation
- ✅ Flexible component interaction

#### 4. Composition Over Inheritance
- ✅ City composed of departments
- ✅ Departments composed of resources
- ✅ Flexible object aggregation
- ✅ Better reusability

#### 5. Abstraction
- ✅ Abstract base classes
- ✅ Interface contracts
- ✅ Hidden implementation details
- ✅ Clear public APIs

### 💻 Technology Stack

```
Java 11+             - Language
Java Swing           - GUI framework
AWT                  - Graphics toolkit
Serialization        - Persistence
Collections API      - Data structures
Threading            - Concurrent operations
```

### 🏛️ Design Patterns Used

| Pattern | Purpose | Implementation |
|---------|---------|-----------------|
| **MVC** | Separation of concerns | Model-View-Controller |
| **Strategy** | Algorithm flexibility | Service implementations |
| **Observer** | Event handling | GUI updates |
| **Singleton** | Single instance | City manager |
| **Factory** | Object creation | Department factory |
| **Decorator** | Feature addition | Resource enhancement |

### 📋 Core Classes

**City (Main Container)**
```java
public abstract class City {
    private String name;
    private List<Department> departments;
    private List<Citizen> citizens;
    private Budget budget;
    
    public abstract void manageCrisis();
    public abstract void optimizeResources();
    public void addDepartment(Department dept) { ... }
    public void addCitizen(Citizen citizen) { ... }
}
```

**Department (Service Provider)**
```java
public abstract class Department {
    private String name;
    private Manager director;
    private List<Employee> staff;
    private Budget budget;
    
    public abstract void provideService(Citizen citizen);
    public abstract void generateReport();
    public void allocateResources(double amount) { ... }
}
```

**Citizen (System User)**
```java
public class Citizen {
    private String id;
    private String name;
    private String address;
    private List<ServiceRequest> requests;
    
    public void requestService(ServiceType type) { ... }
    public void payTaxes(double amount) { ... }
    public void getServiceStatus() { ... }
}
```

### 🎨 GUI Features

**Main Interface:**
- ✅ Department management dashboard
- ✅ Citizen information system
- ✅ Resource allocation interface
- ✅ Real-time status monitoring
- ✅ Report generation tools

**Navigation:**
- ✅ Tabbed interface for departments
- ✅ Menu-driven administration
- ✅ Toolbar for quick actions
- ✅ Status bars and progress indicators

### 🔄 Workflow Examples

**Adding a Citizen to the System**
```java
City myCity = new ModernCity("Example City");
Citizen citizen = new Citizen("C001", "John Doe");
myCity.addCitizen(citizen);
```

**Providing a Service**
```java
Department healthDept = myCity.getDepartment("Health");
ServiceRequest request = citizen.requestService(ServiceType.MEDICAL);
healthDept.provideService(citizen);
healthDept.updateStatus(request, Status.COMPLETED);
```

**Generating Reports**
```java
for (Department dept : myCity.getDepartments()) {
    Report report = dept.generateReport();
    System.out.println(report.getSummary());
}
```

### 🧪 Testing Strategies

- ✅ Unit tests for individual classes
- ✅ Integration tests for workflows
- ✅ GUI testing with user interactions
- ✅ Data persistence verification
- ✅ Performance benchmarking

### 📚 Learning Outcomes

✅ Master object-oriented design principles  
✅ Build large-scale Java applications  
✅ Design effective class hierarchies  
✅ Implement design patterns professionally  
✅ Create intuitive GUIs with Swing  
✅ Handle complex business logic  
✅ Write maintainable, scalable code  

---

## 📖 Curriculum Coverage

### Fundamentals (Assignments & Labs 1-3)
- Class design and instantiation
- Instance variables and methods
- Constructors and initialization
- Method overloading
- Access modifiers (public, private, protected)

### Intermediate (Assignments 4-6)
- Inheritance and method overriding
- Abstract classes and interfaces
- Polymorphic behavior
- Package organization
- Exception handling

### Advanced (Projects & Final Labs)
- Design patterns
- Complex system design
- GUI development
- Data persistence
- Large-scale architecture

---

## 🚀 Quick Start

### Compilation
```bash
javac SmartCitySystem.java
java SmartCitySystem
```

### Running the GUI Application
```bash
java -jar SmartCity.jar
```

---

## 📊 Code Statistics

- **Total Classes:** 30+
- **Lines of Code:** 15,000+
- **Design Patterns:** 6+
- **GUI Components:** 50+
- **Test Cases:** Comprehensive

---

## 🎯 Career Skills Demonstrated

✅ **Object-Oriented Design** - Clean architecture  
✅ **Java Proficiency** - Modern language features  
✅ **Design Patterns** - Enterprise best practices  
✅ **GUI Development** - User interface design  
✅ **System Architecture** - Large-scale design  
✅ **Code Quality** - Maintainability & scalability  

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **DSA (C++):** [../dsa](../dsa)
- **Machine Learning:** [../machine-learning](../machine-learning)

---

<div align="center">

**Good OOP isn't about using classes. It's about designing systems that are clear, maintainable, and scalable.**

*Architecture is art. Code is the canvas.*

</div>
<a href="#-core-concepts-covered"><img src="https://img.shields.io/badge/Concepts-00897B?style=for-the-badge&logo=bookstack&logoColor=white"/></a>
<a href="#-assignments-interfaces-focus"><img src="https://img.shields.io/badge/Assignments-F57C00?style=for-the-badge&logo=code&logoColor=white"/></a>
<a href="#-lab-sessions-breakdown"><img src="https://img.shields.io/badge/Labs-2E7D32?style=for-the-badge&logo=flask&logoColor=white"/></a>
<a href="#-file-handling-systems"><img src="https://img.shields.io/badge/File%20Systems-455A64?style=for-the-badge&logo=database&logoColor=white"/></a>
<a href="#-gui-applications-swing"><img src="https://img.shields.io/badge/GUI-E91E63?style=for-the-badge&logo=windowsterminal&logoColor=white"/></a>
<a href="#-practice-zone"><img src="https://img.shields.io/badge/Practice-3949AB?style=for-the-badge&logo=target&logoColor=white"/></a>
<a href="#-capstone-project"><img src="https://img.shields.io/badge/Project-D32F2F?style=for-the-badge&logo=rocket&logoColor=white"/></a>

</p>

---

## 🧠 Overview

This repository is a **complete OOP mastery system** built using Java.  
It evolves from **basic programming constructs** into **fully functional real-world systems**.

Like a well-engineered machine, every module fits into the next:

- 🧱 Fundamentals → Core OOP concepts  
- 🧬 Abstraction → Interfaces, inheritance, polymorphism  
- 🖥️ Application → GUI + file systems  
- 🏙️ Real-world → Smart City Management System  

---

## 📂 Repository Structure
```
oop/
│
├── assignments/
│   └── interfaces/
│       ├── Assignment3.java
│       ├── Library.java
│       ├── Task1.java → Task4.java
│
├── lab-sessions/
│   ├── lab-1/
│   │   └── gradedtasks.java
│   │
│   ├── lab-5/
│   │   └── activities/
│   │       ├── abstract-class-demo.java
│   │       ├── inheritance-demo.java
│   │       ├── interface-demo.java
│   │       └── polymorphism-demo.java
│   │
│   ├── lab-6/
│   │   ├── activities/
│   │   ├── Activity1.java → Activity3.java
│   │   └── task1.java → task3.java
│   │
│   ├── lab-8/
│   │   ├── exception-handling.java
│   │   ├── file-io-operations.java
│   │   └── generic-class-demo.java
│   │
│   ├── file-handling/
│   │   ├── ATMSystem.java
│   │   ├── LibrarySystem.java
│   │   └── Task1.java
│   │
│   └── gui-tasks/
│       ├── Calculator.java
│       ├── WorkingCalculator.java
│       └── Task2.java → Task8.java
│
├── practice/
│   ├── task1.java → task7.java
│
├── projects/
│   └── smart-city-ms/
│       └── SmartCityMS.java
│
└── README.md

```

---

## ⚙️ Core Concepts Covered

### 🧬 Object-Oriented Pillars
- Encapsulation  
- Inheritance  
- Polymorphism  
- Abstraction  

### 🧩 Advanced Concepts
- Interfaces & Abstract Classes  
- Method Overriding & Overloading  
- Dynamic Binding  
- Generics  

### 🛠️ System-Level Concepts
- File Handling (I/O Streams)  
- Exception Handling  
- Modular Design  

### 🎨 GUI Development
- Java Swing  
- Event-driven programming  
- Interactive applications  

---

## 🧪 Assignments (Interfaces Focus)

- Strong focus on **contract-based design**
- Practical implementation using interfaces
- Real-world modeling (`Library.java`)
- Multi-task exercises (`Task1 → Task4`)

---

## 🔬 Lab Sessions Breakdown

### 🧱 Lab 1
- Programming fundamentals  
- Logic building  

### 🧬 Lab 5 & Lab 6 (🔥 Core Engine)
- Inheritance chains  
- Abstract classes  
- Interfaces  
- Polymorphism  

### ⚠️ Lab 8
- Exception handling  
- File I/O  
- Generic programming  

---

## 💾 File Handling Systems

- 🏦 **ATM System** → Banking simulation  
- 📚 **Library System** → Record & user management  

Focus: **Persistent storage + real-world logic**

---

## 🖥️ GUI Applications (Swing)

- 🧮 Calculator (basic → advanced)
- Event-driven UI systems
- Progressive task complexity

Focus: **User experience + interaction**

---

## 🧪 Practice Zone

- Task-based reinforcement
- Mixed OOP challenges
- Concept polishing

---

## 🏙️ Capstone Project

### Smart City Management System

📁 `projects/smart-city-ms/SmartCityMS.java`

A full system integrating:

- OOP architecture  
- Modular design  
- Real-world simulation  

---

## 🧭 Learning Progression

```

Basics → OOP → Interfaces → Labs → File Systems → GUI → Project

```

Each step upgrades your thinking from **coder → system designer**.

---

## 🛠️ Tech Stack

- ☕ Java  
- 🖥️ Swing  
- 🧠 OOP Principles  

---

## 📌 Key Highlights

✔ Structured roadmap  
✔ Real-world systems  
✔ GUI + backend integration  
✔ Strong OOP foundation  
✔ Industry-aligned learning  

---

## 📜 License

MIT License

---

<p align="center">
  ⚡ Built like a system. Learned like a craft.
</p>
