#include <iostream>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <cstdlib>
#include <ctime>
#include <fstream>

using namespace std;

int main() {
    // Create file for ftok
    ofstream file("shmfile");
    file << "shared";
    file.close();

    // Create shared memory
    key_t key = ftok("shmfile", 65);
    int shmid = shmget(key, sizeof(int) * 3, 0666 | IPC_CREAT);

    if (shmid == -1) {
        cout << "Shared memory creation failed!" << endl;
        return 1;
    }

    int *turns = (int*) shmat(shmid, NULL, 0);

    if (turns == (int*) -1) {
        cout << "Shared memory attach failed!" << endl;
        return 1;
    }

    // Initialize shared memory
    for (int i = 0; i < 3; i++) {
        turns[i] = 0;
    }

    // Create 3 child processes one by one
    for (int i = 0; i < 3; i++) {
        int pid = fork();

        if (pid == 0) {
            // Child process
            int childNum = i;

            srand(time(0) + getpid());
            int randomNum = rand() % 11; // 0 to 10
            int guess, count = 0;

            cout << "\nChild " << childNum + 1
                 << " (PID: " << getpid() << ") started." << endl;
            cout << "User " << childNum + 1
                 << ", guess a number between 0 and 10" << endl;

            do {
                cout << "Enter guess: ";
                cin >> guess;
                count++;

                if (guess == randomNum) {
                    cout << "Correct! User " << childNum + 1
                         << " wins in " << count << " turns.\n";
                } else {
                    cout << "Wrong guess! Try again.\n";
                }

            } while (guess != randomNum);

            // Store result in shared memory
            turns[childNum] = count;

            shmdt(turns);
            exit(0);
        }
        else {
            // Parent waits for this child before creating next
            wait(NULL);
        }
    }

    // Parent prints results
    cout << "\n===== FINAL RESULTS =====" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "User " << i + 1
             << " took " << turns[i] << " turns to win." << endl;
    }

    // Find winner
    int winner = 0;
    for (int i = 1; i < 3; i++) {
        if (turns[i] < turns[winner]) {
            winner = i;
        }
    }

    cout << "\n Winner is User " << winner + 1
         << " with minimum turns = " << turns[winner] << endl;

    // Cleanup
    shmdt(turns);
    shmctl(shmid, IPC_RMID, NULL);

    return 0;
}