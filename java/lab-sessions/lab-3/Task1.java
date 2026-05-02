import java.util.Scanner;
public class task1 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the amount in Decimal: ");
        float amount = sohaib.nextFloat();
        float value = amount * 100;
        int cents = (int) value;
        int dollars = (int) cents / 100;
        int remainingCents = cents % 100;
        int quaters = remainingCents / 25;
        remainingCents %= 25; 
        int dimes = remainingCents / 10;
        remainingCents %= 10;
        int nickels = remainingCents / 5;
        remainingCents %= 5;
        int pennies = remainingCents;
        System.out.println("Dolars = "+dollars  + "\nquaters = "+ quaters + "\ndimes = " + dimes + "\nnickels = " + nickels + "\npennies = " + pennies);
    }
    
}
