#include <iostream>
using namespace std;
struct Item{
    string itemName;
    string itemQuantity;
    string itemPrice;
    Item *next,*prev;
    Item(string x,string y,string z){
        this->itemName=x;
        this->itemQuantity=y;
        this->itemPrice=z;
        next=NULL;
        prev=NULL;

    }

};
struct Location{
    string Location1;
    Location *next,*prev;
    Item *itemFirst;
    Location(string n){
        this->Location1=n;
        next=NULL;
        prev=NULL;
        itemFirst=NULL;

    }

};
struct Section{
    string sectionName;//fruits etc
    Section *next,*prev;
    Location *iFirst;
    Section(string x){
        this->sectionName=x;
        next=NULL;
        prev=NULL;
        iFirst=NULL;
    }

    };
struct Store{
    string storeName;
    Store *next,*prev;
    Section *sFirst;
    Store(string x){
        this->storeName=x;
        next=NULL;
        prev=NULL;
        sFirst=NULL;
        
    }
};


Store *storeFirst=NULL;
Store *storeLast=NULL;
Section *sectionLast=NULL;
Location *locationLast=NULL;
Item *itemLast=NULL;

void addStore();
void addSection();
void addLocation();
void addItem();
void deleteItem();
void DisplayItemsSectionStore();
void DisplayitemsParticularStore();


int main(){
    int number;
    do{
        cout<<"1 to Add new Store"<<endl;
        cout<<"2 to Add new Section "<<endl;
        cout<<"3 to Add new Location "<<endl;
        cout<<"4 to Store an item in a particular section of a particular store."<<endl;
        cout<<"5 to Remove an item in a particular section of a particular store "<<endl;
        cout<<"6 to Display the list of all items of a particular section of a store. "<<endl;
        cout<<"7 to Display the list of items for a given store."<<endl;
        cout<<"8 to Exit"<<endl;
        cout<<"Enter what you want to do "<<endl;
        cin>>number;
        switch(number){
            case 1:
            addStore();
            break;
            case 2:
            addSection();
            break;
            case 3:
            addLocation();
            break;
            case 4:
            addItem();
            break;
            case 5:
            deleteItem();
            break;
            case 6:
            DisplayItemsSectionStore();
            break;
            case 7:
            DisplayitemsParticularStore();
            break;
            case 8:
            cout<<"Ending the program "<<endl;
            break;
            default:
            cout<<"Enter a valid number "<<endl;
        }

    }while(number!=8);

    return 0;



}
void addStore(){
        string x;
        string y;
        cout<<"Enter Store Name"<<endl;
        cin>>x;
        Store *curr=new Store(x);
        if(storeFirst==NULL){
            storeFirst=storeLast=curr;
        }else{
            storeLast->next=curr;
            curr->prev=storeLast;
            storeLast=curr;

        }

    }   
void addSection(){
    string y;
    cout<<"Enter store Name in which you want to make Section"<<endl;
    cin>>y;
    Store *Temp=storeFirst;
    while(Temp!=NULL && Temp->storeName!=y){
        Temp=Temp->next;
    }
    if(Temp==NULL){
        cout<<"store not exsist"<<endl;
        return;
    }
    string x;
    cout<<"Enter Section Name"<<endl;
    cin>>x;
    Section *curr=new Section(x);
    if(Temp->sFirst==NULL){
        Temp->sFirst=sectionLast=curr;
    }else{
        sectionLast->next=curr;
        curr->prev=sectionLast;
        sectionLast=curr;
    }


}

void addLocation() {
    string y1;
    cout << "Enter store Name" << endl;
    cin >> y1;
    Store *Temp = storeFirst;
    while (Temp != NULL && Temp->storeName != y1) {
        Temp = Temp->next;
    }
    if (Temp == NULL) {
        cout << "Store does not exist" << endl;
        return;
    }

    string x1;
    cout << "Enter section Name" << endl;
    cin >> x1;
    Section *Temp2 = Temp->sFirst;
    while (Temp2 != NULL && Temp2->sectionName != x1) {
        Temp2 = Temp2->next;
    }
    if (Temp2 == NULL) {
        cout << "Section does not exist" << endl;
        return;
    }

    string n;
    cout << "Enter Location" << endl;
    cin >> n;
    Location *curr = new Location(n);

    if (Temp2->iFirst == NULL) {
        Temp2->iFirst = locationLast = curr;
    } else {
        Location *Temp3 = Temp2->iFirst;
        while (Temp3->next != NULL) {
            Temp3 = Temp3->next;
        }
        Temp3->next = curr;
        curr->prev = Temp3;
        locationLast = curr;
    }
}

void addItem() {
    string y1;
    cout << "Enter store Name" << endl;
    cin >> y1;
    Store *Temp = storeFirst;
    while (Temp != NULL && Temp->storeName != y1) {
        Temp = Temp->next;
    }
    if (Temp == NULL) {
        cout << "Store does not exist" << endl;
        return;
    }

    string x1;
    cout << "Enter section Name" << endl;
    cin >> x1;
    Section *Temp2 = Temp->sFirst;
    while (Temp2 != NULL && Temp2->sectionName != x1) {
        Temp2 = Temp2->next;
    }
    if (Temp2 == NULL) {
        cout << "Section does not exist" << endl;
        return;
    }

    string n;
    cout << "Enter Location" << endl;
    cin >> n;
    Location *Temp3 = Temp2->iFirst;
    while (Temp3 != NULL && Temp3->Location1 != n) {
        Temp3 = Temp3->next;
    }
    if (Temp3 == NULL) {
        cout << "Location does not exist" << endl;
        return;
    }

    string x, y, z;
    cout << "Enter item Name" << endl;
    cin >> x;
    cout << "Enter item Quantity" << endl;
    cin >> y;
    cout << "Enter item Price" << endl;
    cin >> z;
    Item *newItem = new Item(x, y, z);

    if (Temp3->itemFirst == NULL) {
        Temp3->itemFirst = itemLast = newItem;
    } else {
        Item *curr = Temp3->itemFirst;
        while (curr->next != NULL) {
            curr = curr->next;
        }
        curr->next = newItem;
        newItem->prev = curr;
        itemLast = newItem;
    }
}

void deleteItem() {
    string y1;
    cout << "Enter store Name" << endl;
    cin >> y1;
    Store *Temp = storeFirst;
    while (Temp != NULL && Temp->storeName != y1) {
        Temp = Temp->next;
    }
    if (Temp == NULL) {
        cout << "Store not exist" << endl;
        return;
    }

    string x1;
    cout << "Enter section Name" << endl;
    cin >> x1;
    Section *Temp2 = Temp->sFirst;
    while (Temp2 != NULL && Temp2->sectionName != x1) {
        Temp2 = Temp2->next;
    }
    if (Temp2 == NULL) {
        cout << "Section not exist" << endl;
        return;
    }

    string j;
    cout << "Enter location" << endl;
    cin >> j;
    Location *curr1 = Temp2->iFirst;
    while (curr1 != NULL && curr1->Location1 != j) {
        curr1 = curr1->next;
    }
    if (curr1 == NULL) {
        cout << "Location not exist" << endl;
        return;
    }

    string y;
    cout << "Enter item Name which you want to delete" << endl;
    cin >> y;
    Item *curr = curr1->itemFirst;
    while (curr != NULL && curr->itemName != y) {
        curr = curr->next;
    }
    if (curr == NULL) {
        cout << "Item not found" << endl;
        return;
    }

    if (curr1->itemFirst == curr && curr1->itemFirst == itemLast) {
        delete curr;
        curr1->itemFirst = itemLast = NULL;
        cout << "Item deleted successfully" << endl;
        return;
    }

    if (curr == curr1->itemFirst) {
        curr1->itemFirst = curr->next;
        if (curr1->itemFirst != NULL) {
            curr1->itemFirst->prev = NULL;
        }
        delete curr;
        cout << "Item deleted successfully" << endl;
        return;
    }

    // Handling when the item is the last item
    if (curr == itemLast) {
        itemLast = curr->prev;
        itemLast->next = NULL;
        delete curr;
        cout << "Item deleted successfully" << endl;
        return;
    }

    curr->prev->next = curr->next;
    curr->next->prev = curr->prev;
    delete curr;
    cout << "Item deleted successfully" << endl;
}

void DisplayItemsSectionStore(){
    string y1;
    cout<<"Enter store Name"<<endl;
    cin>>y1;
    Store *Temp=storeFirst;
    while(Temp!=NULL && Temp->storeName!=y1){
        Temp=Temp->next;
    }
    if(Temp==NULL){
        cout<<"store not exsist"<<endl;
        return;
    }
    string x1;
    cout<<"Enter section Name"<<endl;
    cin>>x1;
    Section *Temp2=Temp->sFirst;
    while(Temp2!=NULL && Temp2->sectionName!=x1){
        Temp2=Temp2->next;
    }
    if(Temp2==NULL){
        cout<<"section not exsist"<<endl;
        return;

    } Location *curr=Temp2->iFirst;
    if(curr==NULL){
        cout<<"Item not exsist"<<endl;
        return;

    }
    while(curr!=NULL){
        Item *curr1=curr->itemFirst;
        while(curr1!=NULL){
            cout<<"Name : "<<curr1->itemName<<" Quantity : "<<curr1->itemQuantity<<" Price : "<<curr1->itemPrice<<endl;
            curr1=curr1->next;
        }
        curr=curr->next;
    }

}
void DisplayitemsParticularStore(){
    string y1;
    cout<<"Enter store Name"<<endl;
    cin>>y1;
    Store *Temp=storeFirst;
    while(Temp!=NULL && Temp->storeName!=y1){
        Temp=Temp->next;
    }
    if(Temp==NULL){
        cout<<"store not exsist"<<endl;
        return;
    }
    Section *Temp1=Temp->sFirst; 
    if(Temp1==NULL){
    cout<<"There is no section in this store "<<endl;
    return;
}
while(Temp1!=NULL){
Location *Temp2=Temp1->iFirst;
if(Temp2==NULL){
    Temp1=Temp1->next;
    continue;}
while(Temp2!=NULL){
    Item *Temp3=Temp2->itemFirst;
    if(Temp3==NULL){
        Temp2=Temp2->next;
        continue;}
    while(Temp3!=NULL){
        cout<<"Name : "<<Temp3->itemName<<" Quantity : "<<Temp3->itemQuantity<<" Price : "<<Temp3->itemPrice<<endl;
        Temp3=Temp3->next;
    }
    Temp2=Temp2->next;
}
Temp1=Temp1->next;
}
}
