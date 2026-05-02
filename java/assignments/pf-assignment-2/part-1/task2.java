import java.util.Scanner;
public class Task2 {
    public static void main (String [] args){
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the number : ");
        int num = sohaib.nextInt(); 
        int Factorial = 1;
        int i = 1;
        while (i<= num){
            Factorial= Factorial*i;
            i++;
        }
        System.out.println(Factorial);
    }
}
