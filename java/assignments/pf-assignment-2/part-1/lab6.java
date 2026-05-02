import java.util.Scanner;

public class lab6 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        int max = 0;
        int count = 0;
        int index = 0;
        while (true) {
            System.out.println("Enter number : ");
            int num = sohaib.nextInt();
            if (num >max){
                max = num;
                index = count;
                
            }
            count ++;
            if (num == 0)
                break;
        }
        System.out.println(index);
    }
}
