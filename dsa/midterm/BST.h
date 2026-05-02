
#pragma once
#include"NodeBST.h"
class BST{
    public:
    NodeBST* root;
    BST();
    NodeBST* insert (NodeBST* root,NodeBST* newNode);
    bool searchPatient (NodeBST* root , int patientID);
    void sortby_pID(NodeBST* root);
};