#include<iostream>
using namespace std;
int multiply(int a, int b){
    if (b==1)
        return a;
    return a + multiply(a , b-1);

}
int multiplysecond(int a, int b) {
    int sum = 0;
    int c = (b < 0) ? -b : b;

    for(int i = 1; i <= c; i++) {
        sum += a;
    }
    return (b < 0) ? -sum : sum;
}

int main(){
    int a = multiplysecond(7,3);
    cout<<a;
    return 0;
}