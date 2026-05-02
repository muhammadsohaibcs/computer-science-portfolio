import java.util.Scanner;
public class lab4 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        int count = 0;
        while (true) {
            System.out.println("Enter number : ");
            int num = sohaib.nextInt();
            if (num==0)
                break;
            count += 1;
        }
        System.out.println(count);
        

    }
}
