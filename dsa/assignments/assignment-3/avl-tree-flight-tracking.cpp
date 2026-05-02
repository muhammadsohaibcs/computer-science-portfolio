#include <iostream>
#include <queue>
using namespace std;

struct Node{
    int flightNumber;   
    string departureCity;  
    string arrivalCity; 
    int height; 
    Node *lchild;
    Node *rchild;  
    Node(int x,string y,string z){
        this->flightNumber=x;
        this->departureCity=y;
        this->arrivalCity=z;
        this->height=1;
        lchild=NULL;
        rchild=NULL;
    }
};
class FlightTrackingSystem{
    public :
    Node *root=NULL;

    int Height(Node *p){
        int hl=0,hr=0;
        if(p==NULL){
            return 0;
        }
        if(p->lchild!=NULL){
            hl=p->lchild->height;
        }
        if(p->rchild!=NULL){
            hr=p->rchild->height;
        }
        if(hl>hr){
            return hl+1;
        }else{
            return hr+1;
        }
    }
    int BalanceFactor(Node *p){
        int hl=0,hr=0;
        if(p==NULL){
            return 0;
        }
        if(p->lchild!=NULL){
            hl=p->lchild->height;
        }
        if(p->rchild!=NULL){
            hr=p->rchild->height;
        }
        return hl-hr;
        

    }
    Node* LLRotation(Node *p){
        Node *pl=p->lchild;
        Node *plr=pl->rchild;

        pl->rchild=p;
        p->lchild=plr;
        p->height=Height(p);
        pl->height=Height(pl);
       
        if(root==p){
            root=pl;
        }
        return pl;
    }
    Node* LRRotation(Node *p){
        Node *pl=p->lchild;
        Node *plr=pl->rchild;

        pl->rchild=plr->lchild;
        p->lchild=plr->rchild;

        plr->rchild=p;
        plr->lchild=pl;

        p->height=Height(p);
        pl->height=Height(pl);
        plr->height=Height(plr);
        
       
        if(root==p){
            root=plr;
        }
        return plr;
    }
    Node* RRRotation(Node *p){
        Node *pr=p->rchild;
        Node *prl=pr->lchild;

        pr->lchild=p;
        p->rchild=prl;

        p->height=Height(p);
        pr->height=Height(pr);
       
        if(root==p){
            root=pr;
        }
        return pr;
    }
    Node* RLRotation(Node *p){
        Node *pr=p->rchild;
        Node *prl=pr->lchild;

        pr->lchild=prl->rchild;
        p->rchild=prl->lchild;

        prl->rchild=pr;
        prl->lchild=p;

        p->height=Height(p);
        pr->height=Height(pr);
        prl->height=Height(prl);
       
        if(root==p){
            root=prl;
        }
        return prl;
    }
    Node* Insert(Node *p,int x,string j,string z){
        if(p==NULL){
           Node *y=new Node(x,j,z);
            return y ;
        }
         if (x<p->flightNumber){
            p->lchild=Insert(p->lchild,x,j,z);
        }else if(x>p->flightNumber){
            p->rchild=Insert(p->rchild,x,j,z);
        }
        p->height=Height(p);

        if (BalanceFactor(p) == 2 && BalanceFactor(p->lchild) == 1) {  // LL
            return LLRotation(p);
        } else if (BalanceFactor(p) == 2 && BalanceFactor(p->lchild) == -1) {  // LR
            return LRRotation(p);
        } else if (BalanceFactor(p) == -2 && BalanceFactor(p->rchild) == -1) {  // RR
            return RRRotation(p);
        } else if (BalanceFactor(p) == -2 && BalanceFactor(p->rchild) == 1) {  // RL
            return RLRotation(p);
        }
        
        return p;
    }
    void InOrder(Node *p) {
        if (p) {
            InOrder(p->lchild);
            cout <<"Flight Number : "<<p->flightNumber<<" DepartureCity : "<<p->departureCity<<" ArrivalCity : "<<p->arrivalCity <<" ";
            InOrder(p->rchild);
        }
    }
  Node* Delete(Node* T, int x) {
    if (T == nullptr) {
        return nullptr; 
    }

    if (x > T->flightNumber) {
        T->rchild = Delete(T->rchild, x); 
        if (BalanceFactor(T) == 2) {
            if (BalanceFactor(T->lchild) >= 0) {
                T = LLRotation(T); 
            } else {
                T = LRRotation(T); 
            }
        }
    } else if (x < T->flightNumber) {
        T->lchild = Delete(T->lchild, x); 
        if (BalanceFactor(T) == -2) {
            if (BalanceFactor(T->rchild) <= 0) {
                T = RRRotation(T); 
            } else {
                T = RLRotation(T);
            }
        }
    } else {
        if (T->lchild == nullptr) {
            Node* temp = T->rchild;
            delete T;
            return temp;
        } else if (T->rchild == nullptr) {
            Node* temp = T->lchild;
            delete T;
            return temp;
        } else {
            Node* successorParent = T;
            Node* successor = T->rchild;

            while (successor->lchild != nullptr) {
                successorParent = successor;
                successor = successor->lchild;
            }

            if (successorParent != T) {
                successorParent->lchild = successor->rchild;
            } else {
                successorParent->rchild = successor->rchild;
            }

            successor->lchild = T->lchild;
            successor->rchild = T->rchild;

            delete T;
            T = successor;
        }
    }

    T->height = Height(T);
    return T;
}


};
int main() {
    FlightTrackingSystem system;
    int choice;

    do {
        cout << "\nFlight Tracking System Menu:\n";
        cout << "1. Add Flight\n";
        cout << "2. Delete Flight\n";
        cout << "3. Display Flights (In-Order Traversal)\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
        case 1: {
            int flightNumber;
            string departureCity, arrivalCity;
            cout << "Enter Flight Number: ";
            cin >> flightNumber;
            cout << "Enter Departure City: ";
            cin.ignore();
            getline(cin, departureCity);
            cout << "Enter Arrival City: ";
            getline(cin, arrivalCity);

            system.root = system.Insert(system.root, flightNumber, departureCity, arrivalCity);
            cout << "Flight added successfully.\n";
            break;
        }
        case 2: {
            int flightNumber;
            cout << "Enter Flight Number to delete: ";
            cin >> flightNumber;

            system.root = system.Delete(system.root, flightNumber);
            cout << "Flight deleted successfully (if existed).\n";
            break;
        }
        case 3:
            cout << "Flights (In-Order Traversal):\n";
            system.InOrder(system.root);
            cout << endl;
            break;

        case 4:
            cout << "Exiting system. Goodbye!\n";
            break;

        default:
            cout << "Invalid choice. Please try again.\n";
        }
    } while (choice != 4);

    return 0;
}
