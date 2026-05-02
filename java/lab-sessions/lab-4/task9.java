import java.util.Scanner;
public class task9 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner (System.in);
        System.out.println("Enter the number of pennies");
        int pennies = sohaib.nextInt();
        System.out.println("Enter the number of nickels");
        int nickels = sohaib.nextInt();
        System.out.println("Enter the number of dimes");
        int dimes = sohaib.nextInt();
        System.out.println("Enter the number of quaters");
        int quaters = sohaib.nextInt();
        int Total = pennies + (nickels*5) + (dimes*10) + (quaters *25);
        int dollar =  Total/100;
        if (dollar==1)
            System.out.println("You win");
        else
            System.out.println("You lost");
    
    }
    }

