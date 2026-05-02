// public class main{
//     public static void main(String[] args) {
//         // Bubble sort
//         int [] numbers = {11 ,2, 33 , 14 ,8};
//         for (int i = 0; i < numbers.length - 1; i++) {
//             for (int j = 0; j < numbers.length-i-1; j++) {
//                 if (numbers[j] > numbers[j+1]){
//                     int temp = numbers[j];
//                     numbers[j]=numbers[j+1];
//                     numbers[j+1]= temp ;

//                 }
//             }
//         }
//         for (int num : numbers) {
//             System.out.print(num + " ");}

//     }
// }
// public class main{
//     public static void main(String[] args) {
//         // Bubble sort
//         int [] numbers = {11 ,2, 33 , 14 ,8};
//         for (int i = 0; i < numbers.length - 1; i++) {
//             for (int j = 0; j < numbers.length-i-1; j++) {
//                 if (numbers[j] > numbers[j+1]){
//                     int temp = numbers[j];
//                     numbers[j]=numbers[j+1];
//                     numbers[j+1]= temp ;

//                 }
//             }
//         }
//         for (int num : numbers) {
//             System.out.print(num + " ");}

//     }
// }
// public class main{
//     public static void number (int n) {
//         if (n==0){
//             System.out.println(sum);
//             return;
//         }
//         int sum=1+n;
//         number(n-1,sum);
//         System.out.println(sum);
        

//     }
//     public static void main(String[] args) {
//         number(6,0);
// }
// }
// public class Recursion1 {
//     public static void printFib(int a, int b, int n) {
//         if(n == 0) {
//             return;
//         }
//         int c = a + b;
//         System.out.println(c);
//         printFib(b, c, n-1);
//     }

//     public static void main(String args[]) {
//         int a = 0, b = 1;
//         System.out.println(a);
//         System.out.println(b);
//         int n = 7;
//         printFib(a, b, n-2);
//     }
// }
// public class Recursion1 {
//     public static int calcPower(int x, int n) {
//         if (n == 0) { // base case 1
//             return 1;
//         }
//         if (x == 0) { // base case 2
//             return 0;
//         }
//         int xPowNm1 = calcPower(x, n - 1);
//         int xPown = x * xPowNm1;
//         return xPown;
//     }

//     public static void main(String args[]) {
//         // Test the calcPower method
//         System.out.println(calcPower(2, 3)); // Expected output: 8
        
//     }
// }
public class Recursion1 {
//     public static int calcPower(int x, int n) {
//         if (n == 0) { // base case 1
//             return 1;
//         }
//         if (x == 0) { // base case 2
//             return 0;
//         }

//         // if n is even}   
//         if (n % 2 == 0) {
//             int c= calcPower(x, n / 2) * calcPower(x, n / 2);
//             return c;
//         } else { // if n is odd
//             int c=calcPower(x, n / 2) * calcPower(x, n / 2) *x;
//             return c;
//         }
//     }
    // public static void reverse ( String orginal,int n){
    //     if (n== orginal.length()){
    //         return;
    //     }
    //     String newstring= " " + orginal.charAt(n);
    //     reverse(orginal,n+1);
    //     System.out.println( newstring);
    // }
    public static void pattern(int rows,int columns){
        int y = columns;
        if (rows== 0){
            return;
        }
        if (columns== 0){
            System.out.println();
            pattern(rows-1, y);
        }
        else{

        String shape = "*";
        System.out.print(shape);
        pattern(rows, columns-1);}

  
    }


    

    public static void main(String args[]) {
    //     int x = 2, n = 6; // Example values
    //     int ans = calcPower(x, n);
    //     System.out.println(ans);
    //     reverse("qwer",0);
        pattern(5, 4);}
    // }
}
