
#include "LinkedList.h"
#include "Stack.h"
#include "Queue.h"
#include <fstream>
#include <sstream>
#include <vector>
using namespace std;
void LinkedList::insert(Node* newNode) {
    if (head == NULL) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
}
void LinkedList::deletePatient(int patientID) {
    if (head == NULL) {
        cout << "NO Data Exists" << endl;
        return;
    }

    Node* temp = head;
    Node* prev = NULL;

    while (temp != NULL) {
        if (temp->patientID == patientID) {
            if (temp == head) {
                head = head->next;
                delete temp;
                temp = head;
            } else {
                prev->next = temp->next;
                delete temp;
                temp = prev->next;
            }
        } else {
            prev = temp;
            temp = temp->next;
        }
    }

    cout << "Patient record(s) deleted successfully" << endl;
}
void LinkedList::patientRecord(int patientID) {
    if (head == NULL) {
        cout << "NO Data Exists" << endl;
        return;
    }
    Node* temp = head;
    Stack s1;
    while (temp != NULL) {
        if (temp->patientID == patientID) {
             s1.push_front(temp);
        } 
        temp = temp->next;
    }
    cout << "The Details of Patient having PatientID " << patientID << " is:\n" << endl;
    s1.display();
}
void LinkedList::patientsByAge() {
    if (head == NULL) {
        cout << "NO Data Exists" << endl;
        return;
    }
    Node* temp = head;
    PriorityQueue q;
    while (temp != NULL) {
        q.enqueue(temp);
        temp = temp->next;
    }
    q.display();
}
void LinkedList::display() {
    Node* temp = head;
    printf(" | %-7s | %-9s | %-4s | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n", 
        "visitID", "patientID","Age" ,"appointmentNo", "visitDate", "department", "disease", "doctorName", "medicines");
    cout << "----------------------------------------------------------------------------------------------------------------------------------------------" << endl;

    while (temp != NULL) {
        printf(" | %-7s | %-9d | %-4d | %-13s | %-10s | %-17s | %-13s | %-13s | %-14s\n",
            temp->visitID.c_str(),
            temp->patientID,
            temp->age,
            temp->appointmentNo.c_str(),
            temp->visitDate.c_str(),
            temp->department.c_str(),
            temp->disease.c_str(),
            temp->doctorName.c_str(),
            temp->medicines.c_str()
        );
        cout << "-------------------------------------------------------------------------------------------------------------------------------------------------" << endl;
        temp = temp->next;
    }
    cout << endl;
}
void LinkedList::saveRecords() {
    Node* temp = head;
    fstream f2("abc.csv", ios::out);
    if (!f2.is_open()) {
        cout << "Error opening file!" << endl;
        return;
    }
    f2 << "VisitID,PatientID,Age,AppointmentNo,VisitDate,Department,Disease,DoctorName,Medicines\n";

    while (temp != NULL) {
        string record = temp->visitID + "," +
                        to_string(temp->patientID) + "," +
                        to_string(temp->age) + "," +
                        temp->appointmentNo + "," +
                        temp->visitDate + "," +
                        temp->department + "," +
                        temp->disease + "," +
                        temp->doctorName + "," +
                        temp->medicines;
        f2 << record << "\n"; 
        temp = temp->next;
    }
    f2.close();
    cout << "Records saved successfully to abc.csv" << endl;
}
