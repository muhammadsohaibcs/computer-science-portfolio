import java.util.*;
public class lab7 {
    public static void main(String[] args) {
        int count = 0;
        Scanner sohaib = new Scanner(System.in);
        while (true) {
            System.out.println("Enter number : ");
            int num = sohaib.nextInt();
            if (num % 2 == 0){
                count++;
                
            }
            if (num == 0)
                break;
        }
        System.out.println(count-1);
    }
}
