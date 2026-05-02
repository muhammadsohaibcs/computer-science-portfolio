import java.util.Scanner;
public class Task4 {
    public static void Sign (int x) {
        if (x>0)
            System.out.println("x is positive");
        else if (x<0)
            System.out.println("x is negative");
        else
            System.out.println("x is zero");

    }
    public static void main(String[] args) {
        Scanner sohaib = new Scanner (System.in);
        int x = sohaib.nextInt();
        int y = sohaib.nextInt();
        int X = sohaib.nextInt();
        if (x < y)
            System.out.println(x+" is smaller");
        else
            System.out.println(y+ "is smaller");
        Sign(X);
        if (x < y && x < X)
            System.out.println(x+" is smaller");
        else if (y < x && y < X  )
            System.out.println(y + "is smaller");
        else
            System.out.println(X + "is smaller");
    }
    
}
