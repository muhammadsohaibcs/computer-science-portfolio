#include <iostream>
#include <cstdlib>
#include <ctime>
#include <pthread.h>
#include <chrono>
using namespace std;
using namespace chrono;

#define SIZE 1000

int arr[SIZE];
long long fact[SIZE];
int primeCount = 0;

// Factorial function
long long factorial(int n) {
    long long fact = 1;
    for(int i = 1; i <= n; i++)
        fact *= i;
    return fact;
}

// Prime check
bool isPrime(int n) {
    if(n < 2) return false;
    for(int i = 2; i*i <= n; i++) {
        if(n % i == 0)
            return false;
    }
    return true;
}

// Thread 1 → Factorial
void* computeFactorial(void* arg) {
    for(int i = 0; i < SIZE; i++) {
        fact[i] = factorial(arr[i]);
    }
    pthread_exit(NULL);
}

// Thread 2 → Prime Count
void* countPrimes(void* arg) {
    for(int i = 0; i < SIZE; i++) {
        if(isPrime(arr[i]))
            primeCount++;
    }
    pthread_exit(NULL);
}

int main() {
    srand(time(0));

    for(int i = 0; i < SIZE; i++) {
        arr[i] = rand() % 100 + 1;
    }

    pthread_t t1, t2;

    // Start time
    auto start = high_resolution_clock::now();

    // Create threads
    pthread_create(&t1, NULL, computeFactorial, NULL);
    pthread_create(&t2, NULL, countPrimes, NULL);

    // Join threads
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    // End time
    auto end = high_resolution_clock::now();

    auto duration = duration_cast<milliseconds>(end - start);

    cout << "Multi-thread Execution Time: " << duration.count() << " ms" << endl;
    cout << "Prime Count: " << primeCount << endl;

    return 0;
}