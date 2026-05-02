import java.util.Scanner;
public class task7 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the length of rectangle 1 : ");
        int length1 = sohaib.nextInt();
        System.out.println("Enter the width of rectangle 1 : ");
        int width1 = sohaib.nextInt();
        System.out.println("Enter the length of rectangle 2 : ");
        int length2 = sohaib.nextInt();
        System.out.println("Enter the width of rectangle 2 : ");
        int width2 = sohaib.nextInt();
        int area1 = length1 * width1;
        int area2 = length2 * width2;
        if (area1>area2)
            System.out.println("Area of 1st rectangle is  greater");
        else if (area1==area2)
            System.out.println("Area of 1st rectangle is  equal to 2nd rectangle");
        else
            System.out.println("Area of 2nd rectangle is  greater");
        
    }
}
