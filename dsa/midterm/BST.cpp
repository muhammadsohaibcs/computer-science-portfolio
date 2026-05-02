#include <fstream>
#include <sstream>
#include <vector>
#include "BST.h"
BST ::BST(){
    root = nullptr;
    fstream f1;
    f1.open("abc.csv");
    if (!f1.is_open()) {
        cout << "Error opening file!" << endl;
        return ;
    }
    string line;
    int lines = 0;
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
                NodeBST* n = new NodeBST(a[0], patientID, age, a[3], a[4], a[5], a[6], a[7], a[8]);
                root=insert(root , n);
            }
            lines++;
    }
}
NodeBST* BST ::insert(NodeBST* root,NodeBST* newNode){
    if (root == nullptr)
        return newNode;
    if (root->patientID > newNode->patientID)
        root->left = insert(root->left , newNode);
    else if (root->patientID < newNode->patientID){
        root->right = insert(root->right , newNode);
    }
        return root;
}
bool BST::searchPatient(NodeBST* root, int patientID) {
    if (root == nullptr) {
        return false;
    } 
    else if (root->patientID == patientID) {
        return true;
    } 
    else if (root->patientID > patientID) {
        return searchPatient(root->left, patientID);
    } 
    else {
        return searchPatient(root->right, patientID); 
    }
}
void BST::sortby_pID(NodeBST* root){
    if(root==nullptr){
        return;
    }
    sortby_pID(root->left);
    cout<<root->patientID<<endl;
    sortby_pID(root->right);

}
