import java.util.Scanner;
public class task8 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the date : ");
        int date = sohaib.nextInt();
        System.out.println("Enter the Month number : ");
        int month = sohaib.nextInt();
        System.out.println("Enter the last 2 digits of the year : ");
        int year = sohaib.nextInt();
        if (year == date*month)
            System.out.println("The date is magic");
        else
            System.out.println("The date is not magic");
    
        
    }
}
