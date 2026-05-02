#include <iostream>
using namespace std;

struct Item {
    string Location1;
    string itemName;
    string itemQuantity;
    string itemPrice;
    Item *next, *prev;

    Item(string n, string x, string y, string z) {
        this->Location1 = n;
        this->itemName = x;
        this->itemQuantity = y;
        this->itemPrice = z;
        next = NULL;
        prev = NULL;
    }
};

struct Section {
    string sectionName; // fruits, etc.
    Section *next, *prev;
    Item *iFirst;

    Section(string x) {
        this->sectionName = x;
        next = NULL;
        prev = NULL;
        iFirst = NULL;
    }
};

struct Store {
    string storeName;
    Store *next, *prev;
    Section *sFirst;

    Store(string x) {
        this->storeName = x;
        next = NULL;
        prev = NULL;
        sFirst = NULL;
    }
};

Store *storeFirst = NULL;
Store *storeLast = NULL;
Section *sectionLast = NULL;
Item *itemLast = NULL;

void addStore();
void addSection();
void addItem();
void deleteItem();
void DisplayItemsSectionStore();
void DisplayItemsParticularStore();

int main() {
    int number;
    do {
        cout << "1 to Add new Store" << endl;
        cout << "2 to Add new Section " << endl;
        cout << "3 to Store an item in a particular section of a particular store." << endl;
        cout << "4 to Remove an item in a particular section of a particular store" << endl;
        cout << "5 to Display the list of all items of a particular section of a store" << endl;
        cout << "6 to Display the list of items for a given store" << endl;
        cout << "7 to Exit" << endl;
        cout << "Enter what you want to do: " << endl;
        cin >> number;

        switch (number) {
            case 1:
                addStore();
                break;
            case 2:
                addSection();
                break;
            case 3:
                addItem();
                break;
            case 4:
                deleteItem();
                break;
            case 5:
                DisplayItemsSectionStore();
                break;
            case 6:
                DisplayItemsParticularStore();
                break;
            case 7:
                cout << "Ending the program" << endl;
                break;
            default:
                cout << "Enter a valid number" << endl;
        }
    } while (number != 7);

    return 0;
}

void addStore() {
    string x;
    cout << "Enter Store Name" << endl;
    cin >> x;
    Store *curr = new Store(x);
    if (storeFirst == NULL) {
        storeFirst = storeLast = curr;
    } else {
        storeLast->next = curr;
        curr->prev = storeLast;
        storeLast = curr;
    }
}

void addSection() {
    string y;
    cout << "Enter store Name in which you want to make Section" << endl;
    cin >> y;
    Store *Temp = storeFirst;
    while (Temp != NULL && Temp->storeName != y) {
        Temp = Temp->next;
    }
    if (Temp == NULL) {
        cout << "Store does not exist" << endl;
        return;
    }

    string x;
    cout << "Enter Section Name" << endl;
    cin >> x;
    Section *curr = new Section(x);
    if (Temp->sFirst == NULL) {
        Temp->sFirst = sectionLast = curr;
    } else {
        sectionLast->next = curr;
        curr->prev = sectionLast;
        sectionLast = curr;
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

    string n, x, y, z;
    cout << "Enter Location" << endl;
    cin >> n;
    cout << "Enter item Name" << endl;
    cin >> x;
    cout << "Enter item Quantity" << endl;
    cin >> y;
    cout << "Enter item Price" << endl;
    cin >> z;

    Item *newItem = new Item(n, x, y, z);
    if (Temp2->iFirst == NULL) {
        Temp2->iFirst = itemLast = newItem;
    } else {
        Item *curr = Temp2->iFirst;
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
    string y;
    cout << "Enter item Name which you want to delete" << endl;
    cin >> y;

    Item *curr = Temp2->iFirst;
    while (curr != NULL && (curr->Location1 != n || curr->itemName != y)) {
        curr = curr->next;
    }
    if (curr == NULL) {
        cout << "Item not found" << endl;
        return;
    }

    if (Temp2->iFirst == curr && curr->next == NULL) {
        delete curr;
        Temp2->iFirst = itemLast = NULL;
        cout << "Item deleted successfully" << endl;
        return;
    }

    if (Temp2->iFirst == curr) {
        Temp2->iFirst = curr->next;
        curr->next->prev = NULL;
        delete curr;
        cout << "Item deleted successfully" << endl;
        return;
    }

    if (itemLast == curr) {
        itemLast = curr->prev;
        curr->prev->next = NULL;
        delete curr;
        cout << "Item deleted successfully" << endl;
        return;
    }

    curr->prev->next = curr->next;
    curr->next->prev = curr->prev;
    delete curr;
    cout << "Item deleted successfully" << endl;
}

void DisplayItemsSectionStore() {
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

    Item *curr = Temp2->iFirst;
    while (curr != NULL) {
        cout << "Location: " << curr->Location1 << ", Name: " << curr->itemName
             << ", Quantity: " << curr->itemQuantity << ", Price: " << curr->itemPrice << endl;
        curr = curr->next;
    }
}

void DisplayItemsParticularStore() {
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

    Section *Temp2 = Temp->sFirst;
    while (Temp2 != NULL) {
        Item *curr = Temp2->iFirst;
        while (curr != NULL) {
            cout << "Section: " << Temp2->sectionName << ", Location: " << curr->Location1
                 << ", Name: " << curr->itemName << ", Quantity: " << curr->itemQuantity
                 << ", Price: " << curr->itemPrice << endl;
            curr = curr->next;
        }
        Temp2 = Temp2->next;
    }
}
