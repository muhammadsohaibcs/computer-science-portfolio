# include <iostream>
#pragma once
using namespace std;
class NodeBST{
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
    NodeBST* left;
    NodeBST* right;
    NodeBST(string visitID , int patientID ,int age , string appointmentNo , string	visitDate , string department ,string	disease, string	doctorName , string	medicines);
};