import java.util.Scanner;

public class lab5 {
    public static void main(String[] args) {
         Scanner sohaib = new Scanner(System.in);
        int max = 0;
        while (true) {
            System.out.println("Enter number : ");
            int num = sohaib.nextInt();
            if (num >max)
                max = num;
            else if (num == 0)
                break;
        }
        System.out.println(max);
        
    }
}
