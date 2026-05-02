#include<iostream>
#pragma once
using namespace std;
class Node{
    public:
    string visitID;
    int	patientID;
    int age;
    string appointmentNo;
    string	visitDate;
    string	department;
    string	disease;
    string	doctorName;
    string	medicines;
    Node* next;
    Node(string visitID , int patientID ,int age, string appointmentNo , string	visitDate , string department ,string	disease, string	doctorName , string	medicines);
};