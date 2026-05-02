import java.util.Scanner;
public class Task2 {
    public static void main(String[] args) {
        Scanner sohaib = new  Scanner(System.in);
        System.out.println("Enter the number of Students : ");
        int N = sohaib.nextInt();
        System.out.println("Enter the number of Apples : ");
        int K = sohaib.nextInt();
        System.out.println("Each Student will take " +  K/N + " Apples and " + K%N + " Apples will remain in the basket");
    }   
    
}
