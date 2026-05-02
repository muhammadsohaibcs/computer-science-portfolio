import java.util.Scanner;
public class Task3 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the number of students in class 1 ");
        int class1 = sohaib.nextInt();
        System.out.println("Enter the number of students in class 2 ");
        int class2 = sohaib.nextInt();
        System.out.println("Enter the number of students in class 3 ");
        int class3 = sohaib.nextInt();
        int desks = (class1+1)/2 + (class2+1)/2 + (class3+1)/2;
        System.out.println(desks);
    }
    
}
