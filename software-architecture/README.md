# 🖥️ Software Architecture & Systems Programming Masterclass

<div align="center">

[![Assembly](https://img.shields.io/badge/Assembly-x86%2Fx86--64-red?style=for-the-badge)](.)
[![Architecture](https://img.shields.io/badge/Architecture-CPU%20%2F%20Memory-blue?style=for-the-badge)](.)
[![Systems](https://img.shields.io/badge/Systems-Low%20Level-orange?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Advanced%20Grade-success?style=for-the-badge)](.)

**Low-level systems programming, computer architecture, and bare-metal development**

</div>

---

## 📂 Directory Structure

```
software-architecture/
├── assembly/                  # x86 and x86-64 assembly
│   ├── basics/
│   │   ├── registers.asm      # CPU registers
│   │   ├── instructions.asm   # Basic instructions
│   │   └── memory.asm         # Memory operations
│   │
│   ├── control-flow/
│   │   ├── conditionals.asm   # Jumps and branches
│   │   ├── loops.asm          # Loop constructs
│   │   └── functions.asm      # Call stack
│   │
│   ├── data-types/
│   │   ├── integers.asm       # Integer operations
│   │   ├── floats.asm         # Floating-point math
│   │   └── strings.asm        # String manipulation
│   │
│   ├── systems/
│   │   ├── interrupt.asm      # Interrupts & exceptions
│   │   ├── paging.asm         # Virtual memory
│   │   ├── segmentation.asm   # Memory segmentation
│   │   └── io.asm             # Input/Output
│   │
│   └── projects/
│       ├── bootloader.asm     # Boot code
│       ├── kernel.asm         # Simple kernel
│       └── vga_graphics.asm   # Graphics driver
│
└── README.md
```

---

## 🎯 Core Topics

### 🖥️ CPU Architecture Fundamentals

#### x86/x86-64 Register Architecture
- **General Purpose Registers:**
  - RAX/EAX/AX/AL - Accumulator
  - RBX/EBX/BX/BL - Base
  - RCX/ECX/CX/CL - Counter
  - RDX/EDX/DX/DL - Data

- **Special Purpose Registers:**
  - RSP/ESP - Stack pointer
  - RBP/EBP - Base pointer
  - RIP/EIP - Instruction pointer
  - RFLAGS - Flags register

- **Register Hierarchy:**
  ```
  64-bit: RAX
  32-bit: EAX
  16-bit: AX
  8-bit:  AL (low), AH (high)
  ```

#### Instruction Set Architecture (ISA)
- **Data Movement:**
  - MOV - Copy data
  - LEA - Load effective address
  - PUSH/POP - Stack operations

- **Arithmetic Operations:**
  - ADD/SUB - Addition/subtraction
  - MUL/IMUL - Multiplication
  - DIV/IDIV - Division
  - INC/DEC - Increment/decrement

- **Logical Operations:**
  - AND/OR/XOR - Bitwise operations
  - NOT - Bitwise NOT
  - SHL/SHR - Shift operations
  - ROL/ROR - Rotate operations

- **Control Flow:**
  - JMP - Unconditional jump
  - JE/JNE - Conditional jumps
  - CALL/RET - Function calls
  - CMP - Comparison

---

### 📚 Memory Architecture

#### Memory Hierarchy
```
CPU Registers (1 KB)  - Fastest, smallest
    ↓
L1 Cache (32-64 KB)   - Very fast
    ↓
L2 Cache (256-512 KB) - Fast
    ↓
L3 Cache (2-8 MB)     - Moderate speed
    ↓
RAM (4-32 GB)         - Slow but large
    ↓
Disk (1-2 TB)         - Very slow, largest
```

#### Memory Layout
```
┌────────────────────────┐
│   Stack (grows down)   │ High address
├────────────────────────┤
│   (Free memory)        │
├────────────────────────┤
│   Heap (grows up)      │
├────────────────────────┤
│   Data segment         │
│   (initialized)        │
├────────────────────────┤
│   BSS segment          │
│   (uninitialized)      │
├────────────────────────┤
│   Text segment (code)  │ Low address
└────────────────────────┘
```

#### Virtual Memory
- **Paging:** Fixed-size memory pages
- **Segmentation:** Variable-size segments
- **Page Tables:** Virtual → Physical mapping
- **TLB:** Translation lookaside buffer
- **Protection:** Read/Write/Execute bits

---

### 🔄 Control Flow & Functions

#### Function Call Convention (x86-64)
**Arguments (AMD64 System V ABI):**
- RDI - First argument
- RSI - Second argument
- RDX - Third argument
- RCX - Fourth argument
- R8 - Fifth argument
- R9 - Sixth argument

**Return Value:**
- RAX - Return value

**Stack-based:** Additional arguments on stack

#### Call Stack
```
┌─────────────────┐
│   arg n         │ (if > 6 args)
│   ...           │
├─────────────────┤
│ Return address  │ (pushed by CALL)
├─────────────────┤
│ Old RBP         │ (saved by function)
├─────────────────┤
│ Local variables │
└─────────────────┘
```

---

### 🎮 I/O & Interrupts

#### Interrupt Handling
- **Hardware Interrupts:**
  - Timer interrupts
  - Keyboard input
  - Disk I/O completion
  - Network packets

- **Software Interrupts:**
  - System calls (INT 0x80, SYSCALL)
  - Exceptions (division by zero)
  - Traps (breakpoints)

#### I/O Operations
- **Port I/O:**
  - IN/OUT instructions
  - Port addressing
  - Device communication

- **Memory-Mapped I/O:**
  - I/O through memory addresses
  - MMIO for peripherals
  - DMA operations

---

### 💾 Bootloader & Kernel

#### Boot Process
```
1. BIOS/UEFI startup
2. Bootloader execution (512 bytes)
3. Load kernel into memory
4. Switch to protected/long mode
5. Jump to kernel code
6. Initialize system
7. Load drivers
8. Start user applications
```

#### Bootloader Features
- **Stage 1:** MBR bootloader
- **Stage 2:** Extended bootloader
- **Kernel Loading:** Load kernel image
- **Mode Switching:** Real → Protected → Long mode
- **GDT Setup:** Global descriptor table

#### Kernel Components
- **Process Management:** Context switching, scheduling
- **Memory Management:** Paging, virtual memory
- **Interrupt Handlers:** Device handling
- **System Calls:** User application interface
- **File System:** Storage and retrieval

---

### 🎨 Graphics & VGA

#### VGA Mode 13h (320x200 256-color)
- **Video Memory:** 0xA0000 (160KB)
- **Pixel Addressing:**
  ```
  Address = 0xA0000 + (y * 320) + x
  ```
- **Palette:**
  - 256-color indexed mode
  - Color register at port 0x3C6-0x3C9

#### Graphics Operations
- **Pixel Drawing:** Set single pixel
- **Lines:** Bresenham algorithm
- **Shapes:** Circles, rectangles
- **Sprites:** Bit-blitting
- **Animation:** Frame buffering

---

## 🏆 Curriculum Coverage

### Fundamentals
- CPU architecture basics
- Register operations
- Memory addressing modes
- Instruction sets

### Intermediate
- Function calls and stack frames
- Memory management
- Control flow with jumps
- Interrupt handling

### Advanced
- Bootloader development
- Kernel programming
- Protected mode operation
- Multi-tasking

### Projects
- bootloader.asm - Boot code
- kernel.asm - Simple OS kernel
- vga_graphics.asm - Graphics driver

---

## 🎓 Learning Outcomes

✅ Understand CPU architecture deeply  
✅ Write efficient assembly code  
✅ Manage memory and registers  
✅ Implement low-level functions  
✅ Develop bootloaders and kernels  
✅ Create graphics and I/O code  
✅ Optimize for performance  
✅ Debug at machine level  

---

## 🚀 Development Environment

### Assembly Syntax
- **Intel Syntax:**
  ```
  mov rax, rbx
  add rax, 1
  ```

- **AT&T Syntax:**
  ```
  movq %rbx, %rax
  addq $1, %rax
  ```

### Tools
```
nasm          - Netwide Assembler
gcc/clang     - Compiler/linker
gdb           - Debugger
objdump       - Disassembler
hexdump       - Hex viewer
bochs/qemu    - Emulators
```

### Compilation
```bash
# Assemble
nasm -f elf64 program.asm -o program.o

# Link
ld -o program program.o

# Run
./program

# Debug
gdb program
```

---

## 📊 Key Concepts Matrix

| Concept | Level | Application | Tools |
|---------|-------|-------------|-------|
| Registers | Beginner | Data storage | debugger |
| Memory | Beginner | Addressing | memory dump |
| Functions | Intermediate | Modularity | gdb |
| Interrupts | Advanced | Hardware | kernel |
| Paging | Advanced | Virtual memory | MMU |
| Boot | Advanced | OS startup | emulator |

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **Java Systems:** [../java](../java)
- **DSA (C++):** [../dsa](../dsa)

---

<div align="center">

**Assembly is where code meets hardware. Understanding it reveals how everything works.**

*Low-level thinking is the foundation of system design.*

</div>
- Memory is manually controlled
- Registers are your variables
- Interrupts are your API
- And every instruction matters

From basic arithmetic to building a **Space Invaders game in Assembly**, this repo evolves from fundamentals → mastery.

---

# 🗂️ Project Structure (Accurate)

```
software-architecture/
│
├── README.md
│
├── assembly/
│ │
│ ├── lab-sessions/
│ │ ├── lab3-activity3.asm # Basic arithmetic (ADD, INC)
│ │ ├── lab4-activity1.asm # Flags & arithmetic behavior
│ │ ├── lab4-activity2.asm # ASCII printing loop
│ │ ├── lab4-activity3.asm # Grading system (if-else logic)
│ │ ├── lab7-activity1.asm # Procedure call (multiplication)
│ │ ├── lab7-activity2.asm # Substring extraction
│ │ └── lab8-task1.asm # 🎮 SPACE INVADERS (VGA)
│ │
│ ├── graded-tasks/
│ │ ├── graded-task1-arithmetic.asm # b² - 4ac computation
│ │ ├── graded-task2-control-flow.asm # Number → ASCII conversion
│ │ ├── lab6-activity1a.asm # Array copy (manual loop)
│ │ ├── lab6-activity1b.asm # Array copy (REP MOVSB)
│ │ ├── lab6-activity2.asm # Substring extraction
│ │ ├── lab6-activity3.asm # Password system
│ │ ├── lab7-task1.asm # String ops + palindrome
│ │ └── lab7-task2.asm # Array sum, avg, sorting
│ │
│ └── (more extensions possible)

```
---

# ⚙️ Core Concepts Covered

## 🧩 1. CPU & Registers
- AX, BX, CX, DX (data operations)
- SI, DI (memory traversal)
- SP, BP (stack control)
- FLAGS (decision making)

## 🧠 2. Memory Handling
- Segment:Offset addressing
- Direct + indexed access
- String instructions (`MOVSB`, `CMPSB`)

## 🔁 3. Control Flow
- Conditional jumps (`JZ`, `JNE`, `JG`)
- Loops (`LOOP`, manual counters)
- Structured branching (if-else in assembly)

## 🧵 4. Procedures
- Reusable logic blocks
- Stack-based execution
- Clean modular design

## 🔢 5. Arithmetic & Logic
- MUL, DIV, ADD, SUB
- Manual expression evaluation
- Bit-level reasoning

---

# 🧪 Highlighted Implementations

## 🧮 Quadratic Expression (b² - 4ac)
- Multi-step register computation
- Temporary storage handling
- Classic math translated to assembly

## 🔐 Password System
- Hidden input using interrupts
- Character masking (`*`)
- String comparison via `CMPSB`

## 🔤 String Processing Engine
- Uppercase / lowercase conversion
- Reverse string logic
- Palindrome detection

## 📊 Array Toolkit
- Sum calculation
- Average using division
- Bubble sort (manual swaps)

---

# 🎮 The Crown Jewel — SPACE INVADERS

### 📺 VGA Mode 13h (320x200, 256 colors)

This is where things go from “student” → “engineer”.

### Features:
- 🎯 Player movement with speed control
- 🔫 Bullet system (player + enemy)
- 👾 Enemy grid (multi-row logic)
- 🛡️ Shields with collision handling
- ❤️ Lives + score system
- 🎨 Direct video memory rendering (0xA000)

### What Makes It Elite:
- No libraries
- No engine
- Pure hardware-level rendering

You are literally painting pixels on memory.

---

# 🛠️ Technologies Used

- **MASM / TASM (x86 Assembly)**
- **8086 Architecture**
- **DOS Interrupts (INT 21h)**
- **VGA Graphics (Mode 13h)**
- **Low-Level Memory Manipulation**

---

# 🚀 Skills Demonstrated

✔ Low-Level Programming  
✔ Memory Optimization  
✔ CPU Architecture Understanding  
✔ Algorithm Implementation without abstractions  
✔ Game Development without frameworks  
✔ Hardware Interaction  

---

# 🧬 Learning Evolution (How This Repo Grows)

| Stage | Focus |
|------|------|
| 🔹 Lab 3 | Arithmetic basics |
| 🔹 Lab 4 | Flags + control flow |
| 🔹 Lab 6 | Arrays & memory |
| 🔹 Lab 7 | Procedures + strings |
| 🔹 Lab 8 | Full game engine |

---

# 🎯 Why This Repo Stands Out

Most developers:
> Write code that runs on machines

This repo:
> Writes code that understands the machine

---

# 👨‍💻 Author

**Muhammad Sohaib**  
Computer Science Student  

---

# 📜 License

MIT License — Free to use, modify, and build upon.

---

# ⭐ Final Thought

This repository is not just practice.

It’s proof that you can:
- Think like a CPU  
- Control memory like an OS  
- And build systems from scratch  

💡 From Assembly → AI… this is how mastery begins.