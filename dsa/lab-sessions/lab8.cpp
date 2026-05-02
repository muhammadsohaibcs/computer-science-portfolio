#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* left;
    Node* right;

    Node(int d) {
        data = d;
        left = nullptr;
        right = nullptr;
    }
};

class BST {
private:
    Node* root;
    Node* insert(Node* node, int v) {
        if (node == nullptr) {
            return new Node(v);
        }
        if (v < node->data) {
            node->left = insert(node->left, v);
        } else {
            node->right = insert(node->right, v);
        }
        return node;
    }
    int countLeaves(Node* node) {
        if (node == nullptr) return 0;
        if (node->left == nullptr && node->right == nullptr) return 1;
        return countLeaves(node->left) + countLeaves(node->right);
    }
    void printLeaves(Node* root) {
        if (root == nullptr) {
            return;
        }

        if (root->left == nullptr && root->right == nullptr) {
            cout << root->data << " ";
        }

        printLeaves(root->left);
        printLeaves(root->right);
    }
    void preOrder(Node* root) {
        if (root == nullptr) return;
        cout << root->data << " ";
        preOrder(root->left);
        preOrder(root->right);
    }
    void postOrder(Node* root) {
        if (root == nullptr) return;
        postOrder(root->right);
        postOrder(root->left);
        cout << root->data << " ";
    }
    void inOrder(Node* root) {
        if (root == nullptr) return;
        inOrder(root->right);
        cout << root->data << " ";
        inOrder(root->left);
    }
    Node* findMin(Node* node) {
        while (node->left != nullptr) {
            node = node->left;
        }
        return node;
    }

    Node* deleteNode(Node* node, int value) {
        if (node == nullptr) return node;
        if (value < node->data) {
            node->left = deleteNode(node->left, value);
        } else if (value > node->data) {
            node->right = deleteNode(node->right, value);
        } else {
            if (node->left == nullptr) {
                Node* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                Node* temp = node->left;
                delete node;
                return temp;
            }
            Node* temp = findMin(node->right);
            node->data = temp->data; 
            node->right = deleteNode(node->right, temp->data); 
        }
        return node;
    }

public:
    BST() {
        root = nullptr;
    }
    void insert(int v) {
        root = insert(root, v);
    }
    int countLeaves() {
        return countLeaves(root);
    }
    void printLeaves() {
        printLeaves(root);
    }
    void preOrder() {
        preOrder(root);
    }
    void postOrder() {
        postOrder(root);
    }
    void inOrder() {
        inOrder(root);
    }
    void deleteNode(int value) {
        root = deleteNode(root, value);
    }
};

int main() {
    BST tree;
    tree.insert(9);
    tree.insert(10);
    tree.insert(8);
    tree.insert(7);
    tree.insert(11);
    tree.insert(6);
    cout << "Leaf Nodes Count: " << tree.countLeaves() << endl;
    cout << "Leaf Nodes: ";
    tree.printLeaves();
    cout << endl;
    cout << "Pre-order Traversal: ";
    tree.preOrder();
    cout << endl;
    cout << "Post-order Traversal: ";
    tree.postOrder();
    cout << endl;
    cout << "In-order Traversal: ";
    tree.inOrder();
    cout << endl;
    tree.deleteNode(10);
    cout << "After Deleting 10 (Pre-order Traversal): ";
    tree.preOrder();
    cout << endl;

    return 0;
}

