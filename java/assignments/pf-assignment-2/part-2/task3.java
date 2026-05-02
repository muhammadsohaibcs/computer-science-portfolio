
import java.util.Scanner;

public class task3 {
    public static void main(String[] args) {
        System.out.println("Enter a decimal value (0 to 15): ");
        int num;
        Scanner sohaib = new Scanner(System.in);
        while (true) { 
            num = sohaib.nextInt();
            if (num<16 && num>-1){
                break;
            }
            System.out.println(num + " is an invalid input");
            
        }
        System.out.println("The hex value is " + Integer.toHexString(num));
        System.out.println("Enter a hex digit : ");
        char a = sohaib.next().charAt(0);
        try {
            System.out.println("The binary value is " + Integer.toBinaryString(Integer.parseInt(Character.toString(a), 16)));
            
        } catch (Exception e) {
            System.out.println(a + " is a invalid input");
        }
    }
}
