
#include "NodeBST.h"
NodeBST :: NodeBST(string visitID , int patientID ,int age , string appointmentNo , string	visitDate , string department ,string disease, string doctorName , string medicines){
    this->visitID = visitID;
    this->patientID = patientID;
    this->age = age;
    this->appointmentNo = appointmentNo;
    this->visitDate = visitDate;
    this->department = department;
    this->disease = disease;
    this->doctorName = doctorName;
    this->medicines = medicines;
    left =NULL;
    right = NULL;
};