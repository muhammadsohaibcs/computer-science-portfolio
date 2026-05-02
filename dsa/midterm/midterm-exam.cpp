# include <iostream>
# include <cstdlib>
#include <ctime> 
using namespace std;
struct value {
    int x;
    int y;
};
void add (value a,int result[4]){
    result[0]= a.x + a.y;
}
void sub (value a,int result[4]){
    result[1]=a.x-a.y;
}
void mul(value a,int result[4]){
    result[2]=a.x* a.y;
}
void div(value a,int result[4]){
    if (a.y==0)
        cout << "You cannot divide a number by zero";
    else
        result[3]=a.x/a.y;
}
int main(){
    srand (time(NULL));
    
    int userinput[4];
    cout << "Welcome to quiz Game \n" ;
    value p1;
    int score =0 ;
    p1.x = rand() % 100;
    p1.y = rand() % 100;
    cout << "Enter addition of " << p1.x << " and " << p1.y << "\n" ;
    cin >> userinput[0];
    cout << "Enter substration of " << p1.x << " and " << p1.y << "\n" ;
    cin >> userinput[1];
    cout << "Enter multiplication of " << p1.x << " and " << p1.y << "\n" ;
    cin >> userinput[2];
    cout << "Enter division of " << p1.x << " and " << p1.y << "\n" ;
    cin >> userinput[3];
    int result[4] ;
    add(p1,result);
    sub(p1,result);
    mul(p1,result);
    div(p1,result);
    for ( int i = 0;i<4;i++)
    {
        cout << "Your Answer "<< userinput [i] <<endl;
        cout <<"Actual Result " << result [i]<<endl;

        if (userinput[i] == result[i] ){
            score++;
        }
    }
    switch (score){
        case 1:
        cout<< "You have got 25% marks";
        break;
        case 2:
        cout<< "You have got 50% marks";
        break;
        case 3:
        cout<< "You have got 75% marks";
        break;
        case 4:
        cout<< "You have got 100% marks";
        break;
        default:
        cout<< "You have got 0% marks";
    }
    return 0;
}
