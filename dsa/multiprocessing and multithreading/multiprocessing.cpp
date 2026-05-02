#include <iostream>
#include <unistd.h>
#include <sys/wait.h>
#include <cstdlib>
#include <ctime>

using namespace std;

// Function to check prime
bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int arr[1000];

    // Seed random
    srand(time(0));

    // Fill array with random numbers (1–100)
    for (int i = 0; i < 1000; i++) {
        arr[i] = rand() % 100 + 1;
    }

    // First fork (Child 1)
    int pid1 = fork();

    if (pid1 == 0) {
        // Child 1 → first 500 elements
        int count = 0;
        for (int i = 0; i < 500; i++) {
            if (isPrime(arr[i])) count++;
        }

        cout << "Child 1 (PID: " << getpid() << ") -> Prime count (first 500): " << count << endl;
        exit(0);
    }

    else {
        // Second fork (Child 2)
        int pid2 = fork();

        if (pid2 == 0) {
            // Child 2 → last 500 elements
            int count = 0;
            for (int i = 500; i < 1000; i++) {
                if (isPrime(arr[i])) count++;
            }

            cout << "Child 2 (PID: " << getpid() << ") -> Prime count (last 500): " << count << endl;
            exit(0);
        }
        else {
            // Parent waits for both children
            wait(NULL);
            wait(NULL);

            cout << "Parent (PID: " << getpid() << ") -> Both children finished." << endl;
        }
    }

    return 0;
}