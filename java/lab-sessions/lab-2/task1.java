import java.util.Scanner;
public class task1 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner (System.in);
        int sum =0;
        int [] responses = new int [40];
        for (int i = 0; i < 10; i++) {
            System.out.println("Rate the cafe between 1 and 10");
            responses [i]= sohaib.nextInt();
            sum +=responses[i];
        }
        System.out.println(sum/40);
    }
}
