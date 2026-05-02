import java.util.Scanner;

public class task1 {
    public static void main(String[] args) {
        // a
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter A : ");
        int a = sohaib.nextInt();
        System.out.println("Enter B : ");
        int b = sohaib.nextInt();
        if (a <= b){
            for (int i= a;i<=b;i++ ){
                System.out.println(i);
            }
            System.out.println(a);
        }
        //b
        if (a<b){
            for (int j = a ; j <= b ; j++){
                System.out.println(j);
            }
            System.out.println("b");
        }
        else if (a>=b){
            for (int k = b ; k <= a ; k++){
                System.out.println(k);
            }
            System.out.println("b");
        }
        //c
        int sum = 0 ;
        int cube = 0;
        System.out.println("Enter the number of integers");
        int limit = sohaib.nextInt();
        for (int l = 1 ; l <=limit ; l++){
            System.out.println("Enter the number "+ l + " : ");
            int num = sohaib.nextInt();
            sum += num;
            //d 
            cube +=num*num*num; 
        }
        System.out.println(sum);
        System.out.println(cube);
        System.out.println("c");
        //d



}
}