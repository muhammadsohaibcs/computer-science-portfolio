import java.util.Scanner;
public class Task3 {
    public static void main(String[] args) {
        int count = 0;
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the number of integers");
        int limit = sohaib.nextInt();
        for (int l = 1 ; l <=limit ; l++){
            System.out.println("Enter the number "+ l + " : ");
            int num = sohaib.nextInt();
            if (num == 0){
                count++;
            }
        }
        System.out.println(count);
}
}
