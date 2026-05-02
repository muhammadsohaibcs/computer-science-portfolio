import java.util.Scanner;
public class Task8 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter a integer between 0 and 1000");
        int num = sohaib .nextInt();
        int digit1 = num % 10;
        num/=10;
        int digit2 = num% 10;
        num/=10;
        System.out.println(digit1+digit2+num);
        
        
    }
}
