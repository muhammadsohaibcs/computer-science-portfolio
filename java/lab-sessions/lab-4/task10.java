import java.util.Scanner;
public class task10 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the number of book purchased : ");
        int books = sohaib.nextInt();
        switch (books) {
            case 0:
                System.out.println("You have earned 0 points");
                break;
            case 1:
                System.out.println("You have earned 5 points");
                break;
            case 2:
                System.out.println("You have earned 15 points");
                break;
            case 3:
                System.out.println("You have earned 30 points");
                break;
    
            default:
                System.out.println("You have earned 60 points");
                break;
        }
    }
}
