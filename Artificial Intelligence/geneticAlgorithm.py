import numpy as np
import random

# -------------------------------
# Create Random Chromosome
# -------------------------------
def create_chromosome():
    return np.array([random.randint(0, 7) for _ in range(8)])

# -------------------------------
# Create Initial Population
# -------------------------------
def create_population(pop_size):
    return [create_chromosome() for _ in range(pop_size)]

# -------------------------------
# Fitness Function
# Counts number of safe queens
# -------------------------------
def fitness(chromosome):
    safe = 0
    for i in range(8):
        attacking = False
        for j in range(8):
            if i == j:
                continue

            # Same column
            if chromosome[i] == chromosome[j]:
                attacking = True

            # Same diagonals
            if abs(i - j) == abs(chromosome[i] - chromosome[j]):
                attacking = True

        if not attacking:
            safe += 1
    return safe  # 0 to 8

# -------------------------------
# Selection (Top 2 chromosomes)
# -------------------------------
def select_parents(population):
    scored = [(fitness(ch), ch) for ch in population]
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[0][1], scored[1][1]

# -------------------------------
# Single Point Crossover
# -------------------------------
def crossover(parent1, parent2):
    point = random.randint(1, 6)
    child1 = np.concatenate((parent1[:point], parent2[point:]))
    child2 = np.concatenate((parent2[:point], parent1[point:]))
    return child1, child2

# -------------------------------
# Mutation
# -------------------------------
def mutation(chromosome, mutation_rate=0.2):
    if random.random() < mutation_rate:
        pos = random.randint(0, 7)
        chromosome[pos] = random.randint(0, 7)
    return chromosome

# -------------------------------
# Genetic Algorithm Main Loop
# -------------------------------
def genetic_algorithm():
    pop_size = int(input("Enter population size: "))
    generations = int(input("Enter number of generations: "))

    population = create_population(pop_size)

    for gen in range(generations):
        print(f"\nGeneration {gen+1}")

        # Check for solution
        for ch in population:
            if fitness(ch) == 8:
                print("✅ Solution Found!")
                print("Chromosome:", ch)
                return

        # Selection
        parent1, parent2 = select_parents(population)

        # Create new population
        new_population = []

        while len(new_population) < pop_size:
            child1, child2 = crossover(parent1, parent2)
            child1 = mutation(child1)
            child2 = mutation(child2)
            new_population.extend([child1, child2])

        population = new_population[:pop_size]

        best_fit = max(fitness(ch) for ch in population)
        print("Best Fitness:", best_fit)

    print("\n❌ No perfect solution found.")
    print("Best chromosome:", max(population, key=fitness))
    print("Fitness:", fitness(max(population, key=fitness)))

# -------------------------------
# Run Algorithm
# -------------------------------
genetic_algorithm()
