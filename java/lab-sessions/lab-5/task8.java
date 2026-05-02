import java.util.Scanner;
public class task8 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter number : ");
        int first = sohaib.nextInt();
        int count = 0;
        while (true) {
            System.out.println("Enter number : ");
            int num = sohaib.nextInt();
            if (num == 0)
                break;
            else if (first >num){
                count++;
                first = num;
            }
        }
        System.out.println(count);

}
}