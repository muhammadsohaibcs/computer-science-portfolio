#include<iostream>
#include "Node.h"
#include "LinkedList.h"
#include "Stack.h"
#include "Queue.h"
#include "NodeBST.h"
#include "BST.h"
#include <fstream>
#include <sstream>
#include <vector>
using namespace std;
int main() {
    fstream f1;
    f1.open("hospital_visits_dataset.csv");
    if (!f1.is_open()) {
        cout << "Error opening file!" << endl;
        return 0;
    }
    string line;
    int lines = 0;
    LinkedList l1;
    while (getline(f1, line)) {
        if (line.empty()) continue;
        string word;
        stringstream s(line);
        vector<string> a;
        while (getline(s, word, ',')) {
            a.push_back(word);
        }
        int patientID;
        stringstream s2(a[1]);
        s2 >> patientID;
        int age;
        stringstream s3(a[2]);
        s3 >> age;
        if (lines != 0) {
            Node* n = new Node(a[0], patientID, age, a[3], a[4], a[5], a[6], a[7], a[8]);
            l1.insert(n);
        }
        lines++;
    }
    l1.saveRecords();

    cout << "Data processing complete." << endl;

    int choice;
    do {
        cout << "\n*********************** Patient Record Management ************************\n";
        cout << "1. Display All Records\n";
        cout << "2. Delete Patient Record (Linked List)\n";
        cout << "3. Display Patient History (Stack)\n";
        cout << "4. Sort and Display Patients by Age (Queue)\n";
        cout << "5. Search Patient (BST)\n";
        cout << "6. Sort all PatientID in accending Order (BST)\n";
        cout << "0. Exit\n";
        cout << "**************************************************************************\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                l1.display();
                break;

            case 2: {
                int pID;
                cout << "Enter the Patient ID to delete: ";
                cin >> pID;
                l1.deletePatient(pID);
                l1.saveRecords();
                break;
            }

            case 3: {
                int pID;
                cout << "Enter the Patient ID to view history: ";
                cin >> pID;
                l1.patientRecord(pID);
                break;
            }

            case 4:
                l1.patientsByAge();
                break;

            case 5: {
                int pID;
                cout << "Enter the Patient ID to search: ";
                cin >> pID;
                BST bst;
                bool found = bst.searchPatient(bst.root, pID);
                cout << (found ? "Patient Found" : "Patient Not Found") << endl;
                break;
            }
            case 6:{
            BST bst;
            bst.sortby_pID(bst.root);
                break;
            }
            case 0:
                cout << "\nExiting program. Goodbye!\n";
                cout << "A copy of the CSV file named 'abc.csv' has been saved to reflect the changes you made.\n";
                break;

            default:
                cout << "Invalid choice. Please try again.\n";
        }

    } while (choice != 0);
    return 0;
}

