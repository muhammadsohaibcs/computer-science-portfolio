#include <iostream>
#include <list>
using namespace std;

const int SIZE = 10;
int hashTable[SIZE];

// 1. Linear Search
int linearSearch(int arr[], int n, int key) {
    for (int i = 0; i < n; i++)
        if (arr[i] == key)
            return i;
    return -1;
}

// 2. Binary Search
int binarySearch(int arr[], int n, int key) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == key) return mid;
        else if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

// 3. Hashing with Linear Probing
void insertLinearProbing(int key) {
    int index = key % SIZE;
    while (hashTable[index] != -1) {
        index = (index + 1) % SIZE;
    }
    hashTable[index] = key;
}

// 4. Hashing with Chaining
class HashChaining {
    int size;
    list<int>* table;
public:
    HashChaining(int s) {
        size = s;
        table = new list<int>[size];
    }

    void insert(int key) {
        int index = key % size;
        table[index].push_back(key);
    }

    void display() {
        for (int i = 0; i < size; i++) {
            cout << i << ": ";
            for (int val : table[i])
                cout << val << " -> ";
            cout << "NULL\n";
        }
    }
};

// 5. Bubble Sort
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

// 6. Selection Sort
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx])
                minIdx = j;
        swap(arr[i], arr[minIdx]);
    }
}

// 7. Insertion Sort
void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key)
            arr[j + 1] = arr[j--];
        arr[j + 1] = key;
    }
}

// 8. Merge Sort
void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

// Utility: print array
void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
}

// MAIN Function
int main() {
    cout << "---- LINEAR SEARCH ----" << endl;
    int arr1[] = {4, 2, 7, 1, 9};
    int idx = linearSearch(arr1, 5, 7);
    cout << "7 found at index: " << idx << endl;

    cout << "\n---- BINARY SEARCH ----" << endl;
    int arr2[] = {1, 2, 4, 7, 9}; 
    idx = binarySearch(arr2, 5, 7);
    cout << "7 found at index: " << idx << endl;

    cout << "\n---- HASHING WITH LINEAR PROBING ----" << endl;
    fill_n(hashTable, SIZE, -1);
    insertLinearProbing(10);
    insertLinearProbing(20);
    insertLinearProbing(30);
    for (int i = 0; i < SIZE; i++)
        cout << i << ": " << (hashTable[i] == -1 ? "_" : to_string(hashTable[i])) << endl;

    cout << "\n---- HASHING WITH CHAINING ----" << endl;
    HashChaining hchain(5);
    hchain.insert(10);
    hchain.insert(15);
    hchain.insert(20);
    hchain.display();

    cout << "\n---- BUBBLE SORT ----" << endl;
    int arr3[] = {5, 2, 9, 1};
    bubbleSort(arr3, 4);
    printArray(arr3, 4);

    cout << "\n---- SELECTION SORT ----" << endl;
    int arr4[] = {5, 2, 9, 1};
    selectionSort(arr4, 4);
    printArray(arr4, 4);

    cout << "\n---- INSERTION SORT ----" << endl;
    int arr5[] = {5, 2, 9, 1};
    insertionSort(arr5, 4);
    printArray(arr5, 4);

    cout << "\n---- MERGE SORT ----" << endl;
    int arr6[] = {5, 2, 9, 1};
    mergeSort(arr6, 0, 3);
    printArray(arr6, 4);

    return 0;
}
